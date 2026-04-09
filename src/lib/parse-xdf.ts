/**
 * Pure Node.js XDF (Extensible Data Format) parser.
 * Replaces the Python pyxdf dependency.
 */

export interface EEGStream {
  name: string;
  srate: number;
  ch_names: string[];
  duration: number;
  data: number[][]; // [channelIndex][sampleIndex]
}

const TAG_STREAM_HEADER = 2;
const TAG_SAMPLES = 3;

interface StreamMeta {
  name: string;
  type: string;
  channelCount: number;
  nominalSrate: number;
  channelFormat: string;
  channelNames: string[];
  samples: number[][]; // each element is one sample: [ch0, ch1, ...]
}

/** Read a variable-length integer (1/4/8 byte length prefix). */
function readVarLen(
  buf: Buffer,
  offset: number
): { value: number; next: number } {
  const numBytes = buf.readUInt8(offset);
  offset += 1;
  let value: number;
  if (numBytes === 1) {
    value = buf.readUInt8(offset);
    offset += 1;
  } else if (numBytes === 4) {
    value = buf.readUInt32LE(offset);
    offset += 4;
  } else if (numBytes === 8) {
    value = Number(buf.readBigUInt64LE(offset));
    offset += 8;
  } else {
    throw new Error(`Invalid NumLengthBytes: ${numBytes}`);
  }
  return { value, next: offset };
}

/** Extract text content of an XML tag (non-nested). */
function xmlText(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
  return m ? m[1].trim() : null;
}

/** Extract all <channel><label>...</label></channel> entries. */
function extractChannelNames(xml: string): string[] {
  const names: string[] = [];
  const re = /<channel>([\s\S]*?)<\/channel>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const label = xmlText(m[1], "label");
    if (label) names.push(label);
  }
  return names;
}

/** Read one sample value from the buffer according to channel_format. */
function readValue(
  buf: Buffer,
  pos: number,
  fmt: string
): { v: number; next: number } {
  switch (fmt) {
    case "float32":
      return { v: buf.readFloatLE(pos), next: pos + 4 };
    case "double64":
      return { v: buf.readDoubleLE(pos), next: pos + 8 };
    case "int8":
      return { v: buf.readInt8(pos), next: pos + 1 };
    case "int16":
      return { v: buf.readInt16LE(pos), next: pos + 2 };
    case "int32":
      return { v: buf.readInt32LE(pos), next: pos + 4 };
    case "int64":
      return { v: Number(buf.readBigInt64LE(pos)), next: pos + 8 };
    default:
      throw new Error(`Unsupported channel format: ${fmt}`);
  }
}

/**
 * Parse an XDF file buffer and return EEG streams.
 * Matches the output of the previous Python parse_xdf.py script:
 *  - Filters for EEG streams only
 *  - Converts µV to V (×1e-6)
 *  - Downsamples to 250 Hz if higher
 */
export function parseXdf(buffer: Buffer): EEGStream[] {
  let offset = 0;

  // Validate magic bytes "XDF:"
  const magic = buffer.toString("ascii", offset, offset + 4);
  if (magic !== "XDF:") {
    throw new Error("Not a valid XDF file");
  }
  offset += 4;

  const streams = new Map<number, StreamMeta>();

  while (offset < buffer.length) {
    if (offset + 2 > buffer.length) break;

    // Read chunk length (variable-length encoded)
    const len = readVarLen(buffer, offset);
    offset = len.next;
    const chunkLen = len.value;

    if (offset + 2 > buffer.length) break;

    // Read chunk tag
    const tag = buffer.readUInt16LE(offset);
    offset += 2;

    const contentLen = chunkLen - 2;
    const contentStart = offset;

    if (tag === TAG_STREAM_HEADER && contentLen >= 4) {
      const streamId = buffer.readUInt32LE(offset);
      const xml = buffer.toString("utf8", offset + 4, contentStart + contentLen);

      streams.set(streamId, {
        name: xmlText(xml, "name") || `Stream_${streamId}`,
        type: xmlText(xml, "type") || "",
        channelCount: parseInt(xmlText(xml, "channel_count") || "0", 10),
        nominalSrate: parseFloat(xmlText(xml, "nominal_srate") || "0"),
        channelFormat: xmlText(xml, "channel_format") || "float32",
        channelNames: extractChannelNames(xml),
        samples: [],
      });
    } else if (tag === TAG_SAMPLES && contentLen >= 4) {
      const streamId = buffer.readUInt32LE(offset);
      const stream = streams.get(streamId);

      if (stream && stream.type.toUpperCase() === "EEG") {
        let pos = offset + 4;
        const end = contentStart + contentLen;

        // Number of samples in this chunk
        const ns = readVarLen(buffer, pos);
        pos = ns.next;
        const numSamples = ns.value;

        for (let i = 0; i < numSamples && pos < end; i++) {
          // Optional timestamp
          const tsBytes = buffer.readUInt8(pos);
          pos += 1;
          if (tsBytes === 8) {
            pos += 8; // skip timestamp value
          }

          // Read channel values
          const sample: number[] = new Array(stream.channelCount);
          for (let ch = 0; ch < stream.channelCount; ch++) {
            const r = readValue(buffer, pos, stream.channelFormat);
            sample[ch] = r.v;
            pos = r.next;
          }
          stream.samples.push(sample);
        }
      }
    }

    // Advance to next chunk
    offset = contentStart + contentLen;
  }

  // Build output: filter EEG, convert units, downsample
  const result: EEGStream[] = [];

  for (const stream of streams.values()) {
    if (stream.type.toUpperCase() !== "EEG") continue;

    let chNames = stream.channelNames;
    if (chNames.length !== stream.channelCount) {
      chNames = Array.from(
        { length: stream.channelCount },
        (_, j) => `${stream.name}_ch${j}`
      );
    }

    const nSamples = stream.samples.length;
    const nCh = stream.channelCount;

    // Transpose (n_samples × n_channels) → (n_channels × n_samples) and convert µV → V
    let data: number[][] = Array.from({ length: nCh }, (_, ch) => {
      const arr = new Array<number>(nSamples);
      for (let s = 0; s < nSamples; s++) {
        arr[s] = stream.samples[s][ch] * 1e-6;
      }
      return arr;
    });

    // Downsample to 250 Hz
    let srate = stream.nominalSrate;
    const targetSrate = 250;
    if (srate > targetSrate) {
      const factor = Math.floor(srate / targetSrate);
      data = data.map((ch) => {
        const out: number[] = [];
        for (let i = 0; i < ch.length; i += factor) {
          out.push(ch[i]);
        }
        return out;
      });
      srate = srate / factor;
    }

    const finalSamples = data[0]?.length || 0;
    const duration = Math.round((finalSamples / srate) * 100) / 100;

    result.push({ name: stream.name, srate, ch_names: chNames, duration, data });
  }

  return result;
}
