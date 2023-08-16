
import json
import sys
input_data = json.loads(sys.stdin.readline())

original_data = input_data

# Convert the data structure
data = {
    "standings": [],
    "tasks": []
}

for group in original_data['standings']:
    for entry in group:
        if 'cumulativeTaskStats' in entry:
            del entry['cumulativeTaskStats']
        data["standings"].append(entry)
        for task in entry['taskStats']:
            if task not in data['tasks']:
                data['tasks'].append(task)




for team in data["standings"]:
    for task in data["tasks"]:
        if task in team["taskStats"]:
            team["taskStats"][task]["taskName"] = task

for team in data["standings"]:
    team["sortedTaskStats"] = sorted(team["taskStats"].values(), key=lambda x: x["time"])

for team in data["standings"]:
    team.pop("taskStats")


sys.stdout.write(json.dumps(input_data))
sys.stdout.flush()
