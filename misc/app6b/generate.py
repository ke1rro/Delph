import os

import pandas

tables = [pandas.read_html(f"tables/{table}")[0] for table in os.listdir("tables")]
data = []
for table in tables:
    for entry in table["Description"]:
        _, entry = entry.split(" ", 1)
        entry, sidc = entry.rsplit(" SIDC: ", 1)
        data.append({"Entry": entry, "SIDC": sidc})

pandas.DataFrame(data).to_csv("data.csv", index=False)
