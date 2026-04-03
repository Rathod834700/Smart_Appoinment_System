# python/queue_optimizer.py
"""
Queue optimizer
- optimize_queue(appointments, predictor=None) -> returns ordered list
appointments is a list of dicts with keys:
  - _id or id
  - patientName
  - doctorName
  - requested_time (ISO string or timestamp)
  - urgency (int, higher = more urgent)
  - features (dict) optional, passed to predictor to estimate duration

predictor is a callable: predictor(features) -> predicted_duration_minutes
If predictor is None, a simple heuristic is used.
"""

from typing import List, Dict, Callable
import heapq
from datetime import datetime

def default_predictor(features: Dict = None) -> float:
    """Fallback predicted duration in minutes."""
    if not features:
        return 15.0
    complexity = float(features.get("complexity", 1))
    age = float(features.get("age", 30))
    dur = 10 + complexity * 5
    if age > 65:
        dur += 5
    return dur

def optimize_queue(appointments: List[Dict], predictor: Callable = None) -> List[Dict]:
    """
    Return appointments ordered to minimize waiting and prioritize urgent cases.
    Strategy:
      - Compute score = urgency_weight * urgency - duration_weight * predicted_duration + time_priority
      - Use a heap to sort by descending score
    """
    if predictor is None:
        predictor = default_predictor

    scored = []
    for appt in appointments:
        features = appt.get("features", {})
        predicted = predictor(features)
        urgency = float(appt.get("urgency", 0))
        # time priority: earlier requested_time gets slight boost
        time_priority = 0
        rt = appt.get("requested_time")
        if rt:
            try:
                dt = datetime.fromisoformat(rt)
                # older requests get higher priority (earlier time -> larger positive)
                time_priority = -dt.timestamp() / 1e9
            except Exception:
                time_priority = 0

        # Tunable weights
        urgency_weight = 10.0
        duration_weight = 1.0

        score = urgency_weight * urgency - duration_weight * predicted + time_priority
        # Use negative score because heapq is min-heap
        heapq.heappush(scored, (-score, appt))

    ordered = []
    while scored:
        _, appt = heapq.heappop(scored)
        ordered.append(appt)
    return ordered

if __name__ == "__main__":
    import json, argparse
    parser = argparse.ArgumentParser(description="Optimize appointment queue")
    parser.add_argument("--input", help="JSON file with appointments array", required=True)
    parser.add_argument("--output", help="Write ordered JSON to file", default=None)
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        appts = json.load(f)

    ordered = optimize_queue(appts)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as out:
            json.dump(ordered, out, indent=2, ensure_ascii=False)
        print("Wrote ordered queue to", args.output)
    else:
        print(json.dumps(ordered, indent=2, ensure_ascii=False))
