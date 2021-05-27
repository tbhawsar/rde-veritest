fn(success): defines everything except 'speed'

useInterval: 
-appends all current values to coordinates (starts at [0000000])
-sets test phases based on these
-console.log(coordinates)
-work out haversine distance
-dont set distance on first render
-set distance on subsequent renders
-work out deltaT
-work out current speed

<!--OLD BC Verification: (numbers also indicate order of verification)
General:
0 = PRE-TEST
1 = IN-PROGRESS
2 = PASS
3 = FAIL

FAILURES (indicated with !)
Time: 
-4 = LOW TIME!
-5 = HIGH TIME!
Distance [km]:
-6 = U MIN DISTANCE!
-7 = R MIN DISTANCE!
-8 = M MIN DISTANCE!
Distance shares [%]:
9 = U MIN SHARE!
10 = U MAX SHARE!
11 = R MIN SHARE!
12 = R MAX SHARE!
13 = M MIN SHARE!
14 = M MAX SHARE!
Altitude:
15 = MAX ALTITUDE!
Speed:
16 = MAX SPEED!
17 = MAX IDLING TIME! -->

<!-- hard failures changed to soft 10, 12, 14, 15 -->
<!-- *Break on Hard Failures* (5, 16, 17) -->




[(-) = checked]
*Break on hard failures (4, 5, 6)*
BC Verification: (numbers also indicate order of verification)
General:
0 = PRE-TEST
1 = IN PROGRESS
2 = PASS
3 = FAIL

FAILURES (indicated with !)
4 = MAX IDLING TIME!
5 = MAX SPEED!
6 = HIGH TIME!
7 = LOW TIME!
8 = U MIN DISTANCE!
9 = R MIN DISTANCE!
10 = M MIN DISTANCE!
11 = U MIN SHARE!
12 = R MIN SHARE!
13 = M MIN SHARE!
14 = U MAX SHARE!
15 = R MAX SHARE!
16 = M MAX SHARE!
17 = MAX ALTITUDE!