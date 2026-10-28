"""Trace visible printed claw artwork, without retaining photographed lighting.

Input is the official front photograph recorded in public/texture-references.json.
The calibration uses stick/face-button centres on the supplied model. This is a
front projection, not a recovered factory UV map or an assertion of exact scale.
"""
import cv2
import json
import numpy as np
from pathlib import Path

root = Path(__file__).resolve().parents[1]
image = cv2.imread(str(root / 'assets/references/wolverine-yellow.jpg'))
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
yellow = cv2.inRange(hsv, (18, 95, 105), (42, 255, 255))
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
detail = gray.astype(float) - cv2.GaussianBlur(gray, (0, 0), 8).astype(float)
regions = np.zeros(gray.shape, np.uint8)
cv2.fillPoly(regions, [np.array([[155,170],[465,170],[435,360],[185,500]]),
                      np.array([[980,470],[1210,520],[1240,840],[1010,880],[970,650]])], 255)
scratches = np.uint8((detail > 8) & (hsv[:,:,1] < 60) & (gray > 35) & (gray < 175) & (regions > 0))*255
def paths(mask, minimum):
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return [[[round((float(p[0])-699.4)/541,5),round((519.5-float(p[1]))/539,5)]
             for p in cv2.approxPolyDP(c,.35,True)[:,0]]
            for c in contours if cv2.contourArea(c) >= minimum]
data = {'calibration': {'center':[699.4,519.5],'pixelsPerUnit':[541,539]},
        'claws':paths(yellow,5),'scratches':paths(scratches,3)}
(root/'src/reference-traces.json').write_text(json.dumps(data,separators=(',',':')),encoding='utf-8')
print('Traced',len(data['claws']),'paint regions and',len(data['scratches']),'scratch regions')
