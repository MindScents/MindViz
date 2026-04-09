"""Parse an XDF file and output EEG streams as JSON to stdout."""
import sys
import json
import numpy as np
import pyxdf


def main():
    xdf_path = sys.argv[1]
    streams_raw, _ = pyxdf.load_xdf(xdf_path)

    eeg_streams = []
    for s in streams_raw:
        info = s["info"]
        stype = info["type"][0] if isinstance(info["type"], list) else info["type"]
        if stype.upper() != "EEG":
            continue

        name = info["name"][0] if isinstance(info["name"], list) else info["name"]
        ch_count = int(
            info["channel_count"][0]
            if isinstance(info["channel_count"], list)
            else info["channel_count"]
        )
        srate = float(
            info["nominal_srate"][0]
            if isinstance(info["nominal_srate"], list)
            else info["nominal_srate"]
        )
        data = s["time_series"].T  # (n_channels, n_samples)

        ch_names = []
        try:
            channels = info["desc"][0]["channels"][0]["channel"]
            for ch in channels:
                ch_names.append(
                    ch["label"][0] if isinstance(ch["label"], list) else ch["label"]
                )
        except (KeyError, TypeError, IndexError):
            ch_names = [f"{name}_ch{j}" for j in range(ch_count)]

        if len(ch_names) != ch_count:
            ch_names = [f"{name}_ch{j}" for j in range(ch_count)]

        data = data * 1e-6

        target_srate = 250.0
        if srate > target_srate:
            factor = int(srate / target_srate)
            data = data[:, ::factor]
            srate = srate / factor

        n_samples = data.shape[1]
        duration = n_samples / srate

        eeg_streams.append(
            {
                "name": name,
                "srate": srate,
                "ch_names": ch_names,
                "duration": round(duration, 2),
                "data": data.tolist(),
            }
        )

    json.dump(eeg_streams, sys.stdout)


if __name__ == "__main__":
    main()
