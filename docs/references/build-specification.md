# HYGIENEX AI — PRODUCTION-QUALITY CODEX MASTER BUILD SPECIFICATION

## PROJECT IDENTITY

**Application:** HYGIENEX AI  
**Category:** Gamified Smart Hand-Hygiene Training, Computer Vision and Hospital Simulation  
**Team:** TECH WIZARDS  
**Deployment target:** Vercel Hobby-compatible static web application  
**Primary environment:** Desktop Chrome, modern laptops and touchscreen kiosks  
**Development objective:** Fully functional, visually exceptional, technically credible hackathon prototype

---

# 0. YOUR ROLE AND OPERATING INSTRUCTIONS

You are Codex acting as a coordinated team of:

- Principal full-stack engineer
- Senior React and TypeScript engineer
- Computer vision researcher
- Machine learning engineer
- Three.js and WebGL specialist
- 3D technical animator
- Premium UI/UX designer
- Healthcare workflow analyst
- Software testing engineer
- Vercel deployment architect

Your task is to CREATE THE ACTUAL APPLICATION, not merely propose its architecture.

Implement the source code, application components, state management, tests, models, animations, simulated environments, data storage and configuration files.

You are authorized to modify and create local project files and install compatible development dependencies.

**DO NOT DEPLOY THE APPLICATION.**

**DO NOT:**
- Run `vercel deploy`
- Run `vercel --prod`
- Push to GitHub or another remote repository
- Create a Vercel project
- Connect paid cloud services
- Require paid API subscriptions
- Upload private webcam recordings
- Invent ML model accuracy
- Present simulation data as real device readings

The final project must be ready for the user to deploy manually to Vercel.

Work autonomously through implementation milestones. Do not stop after creating a landing page or describing future work.

At the end, run the required local validation commands and clearly report which features work, which need trained model data and which require physical hardware.

---

# 1. STUDY THE USER-PROVIDED WORKFLOW REFERENCE

The user has supplied a workflow infographic titled:

**SMART HAND-HYGIENE SYSTEM WORKFLOW**

Inspect the reference image available in the workspace.

If the image exists in the project directory, preserve a copy under:

`docs/references/hand-hygiene-workflow.png`

If it is not available locally, do not invent a file. Implement the exact workflow described below.

Use the infographic as a FUNCTIONAL WORKFLOW REFERENCE rather than copying its old presentation-slide design.

The final application must offer a much more advanced, high-fidelity, interactive experience.

The reference specifies:

### Welcome

Choose between:
- Handwash
- Sanitizer

### Handwash

1. Wet hands
2. Apply soap
3. Palm-to-palm rubbing
4. Back-of-hands rubbing
5. Between-fingers rubbing
6. Backs-of-fingers rubbing
7. Thumb rubbing
8. Fingertips-and-nails rubbing
9. Rinse hands
10. Dry hands using the configured method
11. Complete

### Sanitizer

1. Apply alcohol-based sanitizer to dry hands
2. Palm-to-palm rubbing
3. Back-of-hands rubbing
4. Between-fingers rubbing
5. Backs-of-fingers rubbing
6. Thumb rubbing
7. Fingertips-and-nails rubbing
8. Rub until dry naturally
9. Complete

The application must display every hand movement individually.

It should advance only when appropriate completion evidence exists.

Handwash and sanitizer must not share inappropriate final steps.

A camera cannot directly establish sterility, detect bacterial contamination or reliably confirm complete drying.

Treat movement recognition as an estimate supported by validated evidence.

---

# 2. PRIMARY EXPERIENCE — THE APPLICATION SHOULD FEEL LIKE A REAL PRODUCT

Create an immersive medical simulation environment called:

**HYGIENEX AI — Intelligent Hand Hygiene Experience**

The product combines:

1. A beautiful 3D hospital environment
2. Scenario-based training
3. Interactive hygiene stations
4. A real webcam-based hand tracking engine
5. Animated reference hands teaching correct technique
6. Temporal gesture recognition
7. Immediate feedback
8. Guided validation
9. Gamified progression
10. Performance analytics
11. General Ward and ICU workflow simulations
12. An administrator dashboard

The user should feel that they are training inside an advanced hospital simulation.

However, the interface must remain professionally appropriate for healthcare.

Create realistic interactions without childish gameplay.

The application should be sufficiently polished for a live judge demonstration.

---

# 3. MANDATORY FREE DEPLOYMENT ARCHITECTURE

Use:

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- Zustand
- Three.js
- React Three Fiber
- Drei
- Motion or Framer Motion
- MediaPipe Tasks Vision
- TensorFlow.js
- Dexie / IndexedDB
- Recharts
- Lucide React
- Vitest
- React Testing Library
- Playwright

Choose compatible current stable package versions after inspecting their actual documentation.

Use npm unless the existing repository already establishes another package manager.

## Architecture principle

The deployed application must function without a mandatory backend server.

Run the following directly inside the browser:

- Webcam acquisition
- Hand landmark tracking
- Gesture feature extraction
- ML inference
- 3D rendering
- Scenario simulation
- Gamification
- Session state management
- Local training
- Training sample collection
- Model loading
- Analytics calculations
- Local data persistence

Store browser data in IndexedDB.

Persist small UI settings through localStorage where appropriate.

Use TensorFlow.js IndexedDB model storage for user-trained models.

Use a typed repository abstraction so a hosted database can be added later.

For the hackathon, full functionality in one browser is mandatory. Cross-device synchronization is optional and must not be falsely implied.

Do not require a Python inference server, continuously running Node server, GPU server, paid ML inference endpoint or external database merely to launch the application.

An optional offline Python training pipeline may be included, but production inference must remain browser-compatible.

---

# 4. VERCEL COMPATIBILITY IS NON-NEGOTIABLE

Prepare the repository for Vercel static hosting.

Required configuration:

Framework preset: Vite

Build command:

`npm run build`

Output directory:

`dist`

Install command:

`npm install`

Ensure the package.json scripts include:

- dev
- build
- preview
- lint
- typecheck
- test
- test:e2e
- verify

Create a correct `vercel.json` for SPA deep-link handling:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Keep valid static files served normally.

Put required static ML assets in Vite's public directory and use correct URL paths.

For example:

- public/models/hand_landmarker.task
- public/models/gesture-classifier/model.json
- public/models/gesture-classifier/weights.bin
- public/assets/3d/
- public/assets/audio/
- public/assets/textures/

Only include model weight files that actually exist and are correctly licensed.

Do not fabricate an already-trained gesture model.

Bundle verified MediaPipe runtime dependencies correctly.

Avoid runtime dependency on development-only file paths.

Avoid unnecessary external CDN dependencies.

Ensure all required local assets are included in production builds.

Test:
- Direct route refresh
- Nested routes
- Webcam on HTTPS
- ML model loading
- WASM loading
- 3D asset loading
- IndexedDB persistence
- Navigation without server errors

Never attempt deployment automatically.

Provide `DEPLOY_VERCEL.md` with manual deployment instructions.

---

# 5. WORLD-CLASS UI/UX DESIGN DIRECTION

Build a premium interface inspired by:

- High-end clinical monitoring software
- Architectural digital twins
- Scientific visualization tools
- Professional simulation applications
- Modern spatial computing interfaces
- Premium enterprise product design

Do not produce a generic template dashboard.

## Theme

Use a deliberately designed visual system.

Suggested colors:

- Background: #F5F8FC
- Primary navy: #101D35
- Surface white: #FFFFFF
- Medical teal: #008F91
- Active cyan: #20B9DB
- Success green: #18A66A
- Warning amber: #E6A23C
- Critical red: #DB5360
- Secondary text: #66788A

Support light and dark modes.

The hospital environment can use a darker cinematic 3D viewport while the surrounding interface remains crisp and readable.

Typography:
- Geist or Inter
- Strong display headings
- Precise numerical typography
- Readable medical labels
- Consistent spacing and hierarchy

Avoid:
- Neon cyberpunk themes
- Excessive glowing borders
- Overused gradients
- Unnecessary glass panels
- Huge empty sections
- Unreadable microscopic labels
- Stock-looking AI imagery
- Random animations with no purpose

Every interaction must feel intentional.

Use polished loading transitions, hover states, meaningful microinteractions, keyboard accessibility and clear focus indicators.

Respect reduced-motion preferences.

---

# 6. APPLICATION ROUTES

Implement the following routes:

`/` — Landing and Experience Selection

`/hospital` — Interactive 3D Hospital

`/station` — AI Hand-Hygiene Station

`/station/handwash` — Handwash Guidance

`/station/sanitizer` — Sanitizer Guidance

`/academy` — Hygiene Training Academy

`/challenge` — Gamified Challenge Mode

`/scenarios` — Real-World Hospital Scenarios

`/ml-lab` — Machine Learning Laboratory

`/dashboard` — Hospital Command Center

`/wards/general` — General Ward Monitoring

`/wards/icu` — ICU Monitoring

`/analytics` — Session Analytics

`/audit` — Event and Evidence History

`/devices` — Device Simulation and Health

`/settings` — Configuration

Use code splitting and lazy loading for heavy 3D or ML routes.

Each page must have real functionality.

Do not create pages with buttons that do nothing.

---

# 7. CINEMATIC INTERACTIVE LANDING PAGE

Create an impressive but performant landing experience.

Visual:

A modern Indian hospital interior with realistic architecture, ceiling lights, glass partitions, reception signage, medical workstations and clean clinical corridors.

A stylized 3D digital-twin presentation is acceptable if it achieves better browser performance than photorealistic rendering.

Title:

**HYGIENEX AI**

Subtitle:

**See the technique. Perform the movement. Verify the process.**

Buttons:

- Enter 3D Hospital
- Start Live Hygiene Training
- Explore Simulation
- View Dashboard

Include three animated product capability panels:

1. Real-time computer vision
2. Interactive 3D guidance
3. Evidence-based hygiene monitoring

Use meaningful camera movement.

Do not force a long cinematic sequence on returning users.

Provide a Skip Intro action.

Ensure the page remains responsive if WebGL is unavailable.

---

# 8. HIGH-QUALITY REALISTIC 3D HOSPITAL

Create a navigable interactive 3D hospital scene.

The user must be able to explore a small but believable Indian hospital floor.

Create the following spaces:

### Reception and corridor

- Reception counter
- Waiting seats
- Direction signage
- Glass doors
- Nurse workstation
- Medical posters
- Sanitizer stations

### General Ward

- Four patient beds
- Patient bedside tables
- Nurse station
- Staff entry point
- RFID scanner
- Sanitizer dispenser
- Door sensors
- Visitors

### ICU

- Two monitored patient beds
- ICU doors
- Vital monitor screens
- Medical equipment
- BLE receivers
- Staff tags
- Hygiene stations

### Shared Hygiene Training Station

Create a distinctive hand-hygiene kiosk area with:
- Touchscreen
- Webcam
- Sink
- Soap dispenser
- Sanitizer dispenser
- Air dryer
- Staff identification display

The objects must be clickable.

Clicking the hygiene station opens the actual live guidance interface.

Clicking a bed opens its event timeline.

Clicking an RFID reader shows its status.

Clicking an ICU receiver shows simulated or connected BLE evidence.

## Hospital visualization features

- Orbit camera
- Zoom
- Pan
- Smooth focus-on-object
- Floor cutaway
- Exploded wall mode
- Room isolation
- Camera reset
- First-person optional navigation
- Object tooltips
- Live scenario markers
- Route/path visualization

Provide camera presets:
- Hospital Overview
- General Ward
- ICU
- Hygiene Station

## 3D art quality

Use:
- Proper physically based materials
- Soft contact shadows
- Balanced ambient and directional lighting
- Appropriate interior lighting
- Realistic object proportions
- Correct hospital signage
- Selective ambient occlusion if performant
- Subtle animation for doors and equipment

Avoid expensive effects when they reduce usability.

Use instancing and model reuse.

Use model compression and lazy loading.

Use assets from legitimate free sources where licensing permits.

Record external asset origins and licenses in an asset manifest.

Do not hotlink unverified external GLB files.

---

# 9. REALISTIC ANIMATED 3D HANDS — TOP PRIORITY

This feature must be exceptional.

Create a complete 3D instructional hand animation engine.

File structure:

- `HandReferenceViewer.tsx`
- `AnatomicalHands.tsx`
- `HandRigController.ts`
- `GestureAnimationController.ts`
- `HandMaterials.ts`
- `HandPoseDefinitions.ts`
- `HandAnimationClips.ts`
- `GestureSceneLighting.tsx`

The application must show two realistic human hands.

## Model quality requirements

Preferred asset:

A licensed high-quality rigged pair of anatomical human hands using a GLB/GLTF-compatible format.

The hands must contain:
- Palms
- Wrists
- All five digits
- Distinct thumbs
- Individual finger joints
- Natural knuckle shapes
- Proportionate fingertips
- Smooth surfaces
- Skin-tone materials
- Correct left/right anatomy

A realistic PBR appearance is preferred.

Use appropriate joint weighting to avoid distorted geometry while bending fingers.

If a suitable rigged asset can be legally obtained, include it locally.

If external asset retrieval is unavailable, implement a working articulated procedural fallback and clearly document the visual limitation.

Do not mislabel simplified primitive geometry as a photorealistic rig.

For asset preparation, optionally include a Blender script that creates or rigs the required hands if Blender is available locally.

The browser application must not require Blender to run.

## Animation quality

Animations must show the interaction between BOTH hands.

They must not simply animate independently.

Each gesture requires purposeful:
- Wrist orientation
- Palm orientation
- Finger articulation
- Bilateral positioning
- Reciprocal rubbing
- Realistic looping movement

Use a 60 FPS rendering target on capable systems, with graceful degradation.

Smooth interpolation between keyframes.

Use animation blending or procedural timelines.

Avoid sudden snapping.

Never reload the entire scene between steps.

## Mandatory viewer controls

- Rotate 360 degrees
- Zoom
- Front view
- Side view
- Top view
- Reset
- Pause
- Resume
- Replay
- 0.5× speed
- 1× speed
- 1.5× speed
- 2× speed
- Enable/disable anatomical labels
- Show left/right hand indicators

Allow zooming close enough to understand finger positions.

Offer high-contrast rendering for accessibility.

---

# 10. SIX DISTINCT ANIMATED HAND-RUBBING TECHNIQUES

Implement separate animation sequences for all six movements.

## MOVEMENT 1 — PALM TO PALM

Reference:

Both palms face each other.

Animate the hands rubbing back and forth repeatedly.

Requirements:
- Palm alignment
- Appropriate contact positioning
- Reciprocal motion
- Distinct direction changes
- Smooth continuous loop

Instruction:

"Rub your palms together."

## MOVEMENT 2 — BACK OF HANDS

Reference:

Right palm passes over the back of the left hand with fingers interlaced.

Then reverse the position.

Requirements:
- Different hand orientations
- Visible backs of hands
- Proper finger positioning
- Left/right phases
- Clear rubbing action

Instruction:

"Rub the back of each hand with the opposite palm."

## MOVEMENT 3 — BETWEEN FINGERS

Reference:

Palms face each other.

Fingers interlace.

Animate rubbing between the fingers.

Requirements:
- Interlaced fingers
- Clear finger separation
- Reciprocal hand movement
- Consistent opposing palm orientation

Instruction:

"Interlace your fingers and rub between them."

## MOVEMENT 4 — BACKS OF FINGERS

Reference:

Bend fingers and press their backs against the opposite palm.

Rub using controlled motion.

Requirements:
- Bent finger posture
- Opposite-palm positioning
- Distinct silhouette
- Continuous rubbing motion

Instruction:

"Rub the backs of your fingers against the opposite palm."

## MOVEMENT 5 — THUMB RUBBING

Reference:

One hand wraps around the opposite thumb.

Demonstrate rotational rubbing.

Reverse hands.

Requirements:
- Correct thumb grasp
- Visible rotation
- Both thumbs shown
- Clear bilateral completion

Instruction:

"Rotate around each thumb."

## MOVEMENT 6 — FINGERTIPS AND NAILS

Reference:

Place fingertips against the opposite palm.

Demonstrate rotating/circular rubbing.

Reverse hands.

Requirements:
- Fingertips grouped appropriately
- Opposite palm orientation
- Distinct circular movement
- Both hands included

Instruction:

"Rub your fingertips and nails against the opposite palm."

## Animation acceptance test

The six animations must be visually distinguishable without reading their labels.

They must use genuinely different poses and movements.

Create an animation gallery to inspect all six independently.

Include a development-only debug panel for joint angles and animation playback.

---

# 11. PREMIUM LIVE HAND-HYGIENE STATION

Create a high-end workstation layout.

Use a three-panel interface.

## LEFT PANEL — LIVE WEBCAM

This area displays the real user.

Features:
- Camera selection
- Start camera
- Stop camera
- Camera permission handling
- Mirrored preview
- Correctly aligned tracking overlay
- Two-hand detection
- 21 keypoints per hand
- Hand skeleton connections
- Motion trail option
- Tracking status
- FPS indicator
- Frame quality indicator

Show actual MediaPipe landmarks.

Do not draw random landmark coordinates.

Use real input video frames.

## CENTER PANEL — INTERACTIVE GUIDANCE

Show:
- Hygiene method
- Current movement
- Step index
- Movement description
- Current validation state
- Confidence when available
- Motion repetition evidence
- Left/right phase status
- Step duration
- Overall progress
- Corrective instructions

Large center title example:

**STEP 05 — THUMB ROTATION**

Subtitle:

"Wrap one palm around the opposite thumb. Rotate, then switch."

Display a verification indicator.

States:
- Waiting for hands
- Tracking
- Gesture candidate
- Verifying movement
- Side incomplete
- Step accepted
- Uncertain
- Tracking lost

## RIGHT PANEL — 3D REFERENCE

Show the realistic animated hands performing the currently required technique.

The 3D reference must remain available while the camera is tracking the user.

For each new step:
1. Update the title.
2. Change the reference animation.
3. Reset only the step-specific verification state.
4. Keep the webcam active.
5. Keep the overall session active.
6. Show specific instructions.
7. Begin recognizing the new target movement.

## Important synchronization

The reference model displays the TARGET movement.

The webcam shows the USER'S movement.

The system compares the user's estimated action against the target gesture class.

Do not falsely claim exact 3D surface alignment or direct physical contact verification from a single ordinary RGB camera.

---

# 12. REAL COMPUTER VISION — MEDIAPIPE

Create:

`src/cv/MediaPipeHandTracker.ts`

Use the official MediaPipe Hand Landmarker package.

Configure:
- Video running mode
- Up to two hands
- Valid model asset path
- Explicit detection confidence configuration
- Explicit tracking confidence configuration
- Correct frame timestamps

Track:
- 21 landmarks per detected hand
- Handedness
- Normalized positions
- World landmarks where returned
- Temporal movement history

Create:
- CameraManager
- LandmarkRenderer
- HandTrackingWorker
- TrackingQualityMonitor
- FrameScheduler
- GestureFeatureExtractor

Handle mirrored preview without corrupting actual handedness.

Check handedness and motion consistency across consecutive frames.

Do not assume the first array result always represents the left hand.

Avoid duplicate inference on the same frame.

Implement bounded queues to avoid processing outdated frames.

Process at a configurable inference rate.

Try worker-based processing where browser APIs support it.

Implement a reliable main-thread throttled fallback if worker transfer is unsupported.

Cleanly stop all camera streams and processing loops when leaving the page.

---

# 13. PRECISE HAND MOVEMENT RECOGNITION

This is a critical machine learning requirement.

MediaPipe identifies landmarks but does not automatically provide accurate classifications for the six hygiene-rubbing movements.

Implement a dedicated gesture recognition engine.

File:

`src/ml/HandHygieneGestureEngine.ts`

Required output:

```ts
type GestureClass =
  | "PALM_TO_PALM"
  | "BACK_OF_HANDS"
  | "BETWEEN_FINGERS"
  | "BACKS_OF_FINGERS"
  | "THUMB_ROTATION"
  | "FINGERTIP_ROTATION"
  | "OTHER"
  | "UNKNOWN";

type RecognitionResult = {
  gesture: GestureClass;
  confidence: number | null;
  modelVersion: string | null;
  evidenceSource:
    | "TRAINED_MODEL"
    | "EXPERIMENTAL_HEURISTIC"
    | "RECORDED_REPLAY"
    | "MANUAL_REVIEW";
  trackingQuality: number | null;
  movementDetected: boolean;
  observedCycles: number | null;
  stableDurationMs: number;
  leftPhaseComplete: boolean;
  rightPhaseComplete: boolean;
  verified: boolean;
};
```

Confidence must be derived from real model inference when using the trained classifier.

Do not use Math.random to generate predictions.

Do not create fake scores.

## Feature extraction

Collect temporally ordered landmarks.

Extract:
- Wrist positions
- Palm orientations
- Relative wrist distance
- Relative palm directions
- Finger joint angles
- Finger flexion states
- Fingertip positions
- Thumb positions
- Palm normal estimates
- Relative hand positions
- Landmark velocities
- Relative movement velocities
- Direction changes
- Temporal periodicity
- Finger-interlacing proxies
- Approximate fingertip-to-palm relationships
- Movement stability

Normalize features for:
- Camera framing
- Hand size
- Distance from camera
- Left/right orientation
- Translation

Avoid removing the inter-hand relationships needed for recognition.

Support a sliding temporal window.

Initial experimental configuration:

- 32–64 sampled frames
- Approximately 2–3 seconds of motion context
- Configurable inference rate
- Motion smoothing
- Temporal consistency checks

Tune these experimentally.

These are starting parameters, not established optimal values.

---

# 14. CUSTOM TRAINABLE GESTURE CLASSIFIER

Implement TensorFlow.js training and inference.

Create:
- TemporalGestureModel
- TrainingDatasetManager
- GestureModelTrainer
- GestureEvaluator
- ModelRepository
- InferenceController

Use a lightweight temporal architecture such as:

Input temporal features  
→ normalization  
→ temporal Conv1D layers  
→ nonlinear activation  
→ temporal pooling  
→ dense classification layers  
→ softmax output

An appropriately sized recurrent architecture is acceptable if tested.

Provide an UNKNOWN / OTHER class.

Do not assume that a pose-only static classifier is sufficient.

Recognition must consider movement through time.

## Training interface

Create a functional ML Training Laboratory.

Allow users to:
1. Select a gesture class.
2. Record a hand movement.
3. Inspect tracking quality.
4. Stop recording.
5. Save a labeled landmark sequence.
6. Repeat sample collection.
7. Review dataset counts.
8. Remove bad samples.
9. Train the classifier.
10. Evaluate on held-out data.
11. Save the model.
12. Load the model.
13. Test live inference.

Store numerical landmarks/features in IndexedDB.

Do not store raw webcam video automatically.

Include negative examples such as:
- Unrelated hand motions
- Static hands
- Single-hand gestures
- Incorrect thumb rotation
- Incomplete interlacing
- Insufficient fingertip movement

## Model evaluation

Display genuine:
- Training accuracy
- Validation accuracy
- Loss curves
- Per-class precision
- Recall
- F1 score
- Confusion matrix
- Dataset size
- Model version

Split training and validation by participant or recording session when feasible to reduce leakage.

Use a dedicated held-out test set for final evaluation.

Provide test cases with different:
- Hand sizes
- Skin tones
- Camera angles
- Lighting
- Backgrounds
- Movement speeds
- Hand orientations
- Occlusions

An accurate model requires collected data.

If no model is trained, explicitly show:

**Custom gesture model unavailable — training required.**

Never claim 95%, 98% or 99% accuracy without measured evidence.

---

# 15. ADVANCED VERIFICATION LOGIC

Implement a separate validation engine.

Prediction alone must not automatically advance the workflow.

The system should consider:

1. Both hands visible when required
2. Target gesture predicted
3. Sufficient sustained evidence
4. Actual movement rather than static pose
5. Appropriate repeated rubbing motion
6. Bilateral phases where required
7. Tracking quality
8. Uncertainty thresholds

Use a configurable prototype threshold policy.

Example starting values:

```ts
const validationConfig = {
  minModelConfidence: 0.80,
  minClassMargin: 0.15,
  minStableDurationMs: 1200,
  minMotionCycles: 2,
  requireBothHands: true,
  allowTimerOnlyCompletion: false,
  pauseOnTrackingLoss: true
};
```

Treat these as experimental defaults requiring evaluation and tuning.

Do not claim they are clinically validated.

Apply confidence smoothing and hysteresis.

Avoid noisy step oscillation.

Keep a rolling window of recognition results.

Use an explicit state machine:

IDLE  
→ WAITING_FOR_HANDS  
→ TRACKING  
→ CANDIDATE_DETECTED  
→ VERIFYING  
→ VERIFIED  
→ TRANSITIONING  
→ NEXT_STEP

If incorrect:
- Remain on current step.
- Show corrective feedback.
- Continue the 3D reference loop.

If missing hand:
- Pause validation.
- Request both hands.

If confidence is low:
- Show uncertain recognition.
- Continue collecting evidence.

If camera tracking is lost:
- Preserve previously verified steps.
- Pause the current step.

If the trained model is unavailable:
- Do not invent an ML-approved result.
- Provide explicit experimental guidance or trainer-assisted confirmation.
- Clearly distinguish this from verified live model inference.

---

# 16. HANDWASH PROCEDURE ENGINE

Create a reusable workflow engine using a typed state machine.

Handwash stages:

1. Select Handwash
2. Camera calibration
3. Wet hands
4. Apply soap
5. Palm to palm
6. Back of hands
7. Between fingers
8. Backs of fingers
9. Thumbs
10. Fingertips and nails
11. Rinse
12. Dry
13. Completed

Each step should have:
- Unique ID
- Title
- Instruction
- Illustration
- Corresponding 3D animation
- Completion criteria
- Evidence requirements
- Status
- Start time
- End time

## Wetting and soap stages

Show realistic faucet and soap animations.

Use connected sensor data if available.

Otherwise provide a user-confirmed preparation control.

An ordinary webcam cannot reliably prove that hands are wet or covered in soap.

## Rubbing stages

Require target movement validation as described above.

## Rinsing

Show a water-rinsing instructional animation.

Use water-flow telemetry only if hardware exists.

Otherwise use a clearly marked confirmation.

## Drying

Use an air-dryer animation for the reference workflow.

Support facility-configurable single-use towel drying if desired.

Do not claim camera-only proof of complete drying.

Show the completion result only when required evidence or explicit confirmation is recorded.

---

# 17. SANITIZER PROCEDURE ENGINE

Sanitizer must have a separate preparation and finalization workflow.

Stages:

1. Select Sanitizer
2. Camera calibration
3. Apply sanitizer
4. Palm to palm
5. Back of hands
6. Between fingers
7. Backs of fingers
8. Thumbs
9. Fingertips and nails
10. Rub until dry
11. Completed

Show 3D sanitizer application guidance.

The six movement animations should reuse the same hand-animation engine.

After the sixth rubbing movement, display:

**Continue rubbing until your hands are dry naturally.**

Do not use a dryer.

Do not rinse.

Do not advance based solely on an elapsed timer.

Use configured duration guidance plus actual available evidence.

When operating with only a camera, require a clearly marked user confirmation for dryness.

Completion must be recorded as:

"Guidance sequence completed according to available evidence."

Not:

"Sterility verified."

---

# 18. INTELLIGENT REAL-TIME CORRECTIVE FEEDBACK

Provide contextual feedback based on observed landmarks and model outputs.

Examples:

For palm rubbing:
"Bring both palms together."

For back-of-hands rubbing:
"Switch hands to cover the opposite side."

For between fingers:
"Interlace your fingers more clearly."

For backs of fingers:
"Bend your fingers against the opposite palm."

For thumbs:
"Now rotate around your other thumb."

For fingertips:
"Rotate your fingertips against the opposite palm."

For lost tracking:
"Keep both hands within the frame."

For insufficient evidence:
"Continue this movement until it is recognized."

Only display highly specific corrections when the recognition evidence supports them.

Otherwise provide general guidance instead of pretending to diagnose the exact mistake.

Implement optional browser-based voice guidance using speechSynthesis.

Provide:
- Voice on/off
- Volume
- Speaking rate
- Replay instruction

Use clear and respectful healthcare language.

---

# 19. GAMIFICATION — MAKE IT IMPRESSIVE BUT MEANINGFUL

Create a gamified learning experience.

Game name:

**HYGIENEX ACADEMY**

The game should reward learning, completeness and careful technique.

Do not reward unrealistically fast sanitization.

## Game progression

Create five levels:

LEVEL 1 — Hygiene Initiate

Learn the basic six movements.

LEVEL 2 — Technique Explorer

Complete handwash and sanitizer tutorials.

LEVEL 3 — Ward Guardian

Perform hygiene at appropriate simulated ward checkpoints.

LEVEL 4 — ICU Specialist

Handle more complex ICU scenarios.

LEVEL 5 — Hygiene Champion

Complete advanced training cases with high technique-evidence quality.

## Gamification features

- XP
- Level progression
- Completion badges
- Learning milestones
- Scenario unlocks
- Session replay
- Progress animations
- Achievement gallery
- Personal training history

Badge examples:
- First Technique Completed
- Six Steps Practiced
- Both Thumbs Covered
- Handwash Journey Completed
- ICU Scenario Completed
- Consistency Learner

Achievements must use actual event records or explicitly labeled simulation outcomes.

## Scoring

Use a clearly documented experimental training score.

Possible components:
- Step completion
- Bilateral coverage
- Motion evidence
- Training consistency
- Correct procedural order

Do not translate the score into bacterial removal or cleanliness percentage.

Allow users to retry without punitive language.

## Celebration

After completion:
- Green confirmation
- Subtle confetti
- Progress badge
- Achievement card
- Session summary

Animation should be tasteful and not disrupt a real hospital workflow.

---

# 20. REAL-WORLD SCENARIO GAMEPLAY

Create a Scenario Simulation Laboratory.

The user can choose cases and observe how hand-hygiene decisions affect workflow status.

## SCENARIO 1 — DOCTOR ENTERS GENERAL WARD

Scene:
A doctor approaches a patient bed.

Event:
RFID identifies the staff member.

A simulated 30-second checkpoint begins.

The doctor should perform the configured hygiene action.

Actions:
- Start hygiene station
- Record dispenser activation
- Complete gesture guidance
- Continue patient visit

If missed:
- Generate a reminder
- Create an auditable event
- Allow care to continue

Never physically prevent emergency patient care.

## SCENARIO 2 — NURSE BEFORE PATIENT CONTACT

A nurse prepares to interact with a patient.

Show a contextual hygiene opportunity.

The user must select an appropriate hygiene method and perform the guided sequence.

Successful completion generates a training result.

## SCENARIO 3 — ICU ENTRY

A doctor with a simulated BLE tag enters an ICU zone.

Display:
- Tag ID
- Estimated room
- Receiver
- RSSI
- Checkpoint timer

Start the configured 60-second hygiene checkpoint.

If BLE assignment is uncertain, clearly show the ambiguity.

## SCENARIO 4 — VISITOR CONGESTION

Several visitors enter the General Ward.

Create an educational visitor guidance flow.

Visitors should not automatically generate staff violations.

Allow guest hygiene training without staff identification.

## SCENARIO 5 — WRONG HAND GESTURE

The user performs an incorrect movement in front of the camera.

The application should:
- Detect or flag the mismatch when supported by the model.
- Stay on the current step.
- Replay the 3D reference.
- Show corrective feedback.

This is an especially important live demo.

## SCENARIO 6 — MISSING CAMERA TRACKING

The user moves their hands out of frame.

The system pauses validation.

When the hands return, the active step continues.

## SCENARIO 7 — INCOMPLETE THUMB RUBBING

The user performs one thumb phase but omits the other.

The system must request the missing phase if recognition supports it.

Do not mark the bilateral step as completed prematurely.

## SCENARIO 8 — FULL HYGIENE COMPLETION

The user completes the procedure.

Show:
- Final progress
- Completion evidence
- Uncertain steps if any
- Score
- XP
- Session outcome

## SCENARIO 9 — DISCONNECTED DISPENSER

Simulate dispenser telemetry loss.

The application should show unavailable hardware evidence rather than assuming sanitizer was not used.

## SCENARIO 10 — INCOMPLETE SESSION

The user exits midway.

Record:
- Completed steps
- Current step
- Session interruption
- Remaining requirements

All scenarios must be interactive, not just textual descriptions.

---

# 21. 3D HOSPITAL CHARACTER INTERACTIONS

Include a limited number of animated characters:

- Doctor
- Nurse
- Patient
- Visitor
- Hospital assistant

Use legally permitted lightweight 3D character models if available.

Animations may include:
- Walking
- Standing
- Door entry
- Approaching a sanitizer station
- Handwashing preparation
- Patient-care positioning

Do not overinvest in character animation at the expense of the primary hand-hygiene station.

Each character action must have a meaningful simulation event.

Provide click-to-select character interactions.

The camera should smoothly focus on selected actions.

Support:
- Camera follow
- Character selection
- Event timeline
- Scene reset
- Pause/resume
- 1×/2×/4× simulation speed

Use one deterministic scenario engine shared with the dashboard.

---

# 22. REALISTIC ENVIRONMENT DETAILS

To make the 3D experience credible, add:

- Physically plausible hospital architecture
- Modern clinical furniture
- Ceiling-mounted lighting
- Tiled floors
- Glass partitions
- Indian hospital-style signage
- Patient monitors
- Medical carts
- Wall-mounted dispensers
- Sinks
- Air dryers
- RFID access points
- BLE receiver units
- Staff badges
- Medical instruction posters
- Waiting-room furniture

Optional controlled ambient audio:
- Footsteps
- Quiet hospital ambience
- Door opening
- Hand-dryer sound
- Dispenser click
- Notification tones

Audio must be muted by default until the user enables it.

Include quality presets:

**High:** Rich materials and high-quality lighting

**Balanced:** Optimized assets and moderate effects

**Performance:** Reduced geometry and minimal post-processing

Support WebGL failures gracefully.

Provide an accessible 2D fallback navigation interface.

---

# 23. GENERAL WARD DIGITAL TWIN

Create a functioning General Ward page.

Components:
- 3D ward
- RFID event simulation
- Staff list
- Bed cards
- Entry/exit timeline
- Sanitizer checkpoint timer
- Buzzer status
- Device health
- Common station events

Rules:
- 30-second entry checkpoint
- 30-second exit checkpoint
- Dispenser activation is evidence of dispensing
- Missed evidence creates a reviewable alert
- A late activation updates the event
- Alerts do not block patient care

Use a shared event engine.

Clicking a character or bed should inspect the underlying events.

No random unrelated metrics.

---

# 24. ICU DIGITAL TWIN

Create a separate ICU page.

Components:
- 3D ICU scene
- BLE tag simulation
- Receiver signals
- Room estimate
- Staff presence timeline
- Dispenser status
- Checkpoint countdown
- Device warnings

Rules:
- Configurable 60-second checkpoint
- 4× demo clock option
- Ambiguous BLE location remains ambiguous
- Dispenser use is separate evidence
- Staff presence does not prove patient contact
- Missing telemetry does not prove hygiene failure

Show signal status and event timestamps.

---

# 25. HOSPITAL COMMAND CENTER

Create a premium dashboard with actual working data integration.

Required metrics:
- Recorded hygiene opportunities
- Completed guidance sessions
- Pending reviews
- Missed dispenser checkpoints
- General Ward activity
- ICU activity
- Device status
- Training achievements

Charts:
- Sessions over time
- Gesture recognition outcomes
- Completion by method
- Ward event trends
- Technique difficulty by step
- Training progression
- Device connectivity

Clicking a chart should reveal relevant session details or filter the event table.

Seed realistic demo data only in Simulation Mode.

Clearly label simulated records.

Completing a session should immediately update:
- Session history
- Progression
- Dashboard metrics
- Analytics
- Audit records

---

# 26. ML TRAINING LABORATORY UI

Design the ML Lab as a premium scientific workstation.

Layout:

LEFT:
Live camera with landmark overlay.

CENTER:
Dataset acquisition and training controls.

RIGHT:
Training curves and evaluation outputs.

Include:
- Gesture label selector
- Sample recording controls
- Sample count
- Recorded sequence review
- Dataset export
- Dataset import
- Model training
- Progress
- Validation chart
- Confusion matrix
- Model comparison
- Save model
- Load model
- Activate trained model

Provide model diagnostics.

Use genuine TensorFlow.js operations.

If the browser runs out of memory during training, handle the error and reduce the batch size or offer an offline training workflow.

Do not block the entire UI unnecessarily.

Use clear warnings for insufficient data.

---

# 27. OPTIONAL OFFLINE HIGHER-ACCURACY TRAINING

Include an optional `ml-training/` directory.

The browser application must still work without this directory.

Create scripts for:
- Importing exported landmark sequences
- Dataset validation
- Temporal normalization
- Participant-aware train/validation/test splitting
- Training a compact temporal classifier
- Evaluating each gesture class
- Creating a confusion matrix
- Exporting a browser-compatible model

Use TensorFlow/Keras where practical to enable conversion to TensorFlow.js.

Alternatively use an ONNX-compatible training/export pipeline, provided the browser runtime is integrated and tested.

The training pipeline may take advantage of a local NVIDIA GPU but must not require cloud GPUs.

The final Vercel site should load only the exported lightweight inference model and its compatible runtime.

Avoid shipping large Python dependencies to Vercel.

Include instructions for retraining and updating the browser model.

Do not create random fake weights to imitate a trained classifier.

---

# 28. LIVE MODE, DEMO MODE AND TRAINING MODE

Implement three explicitly distinct modes.

## LIVE MODE

Actual webcam.

Actual MediaPipe tracking.

Actual loaded gesture classifier.

Actual session evidence.

If no validated classifier is available, show the limitation.

Never secretly switch to fabricated predictions.

## GUIDED DEMO MODE

A reliable hackathon showcase experience.

Use:
- Deterministic simulation events
- Pre-recorded consenting landmark sequences where available
- Interactive scenario controls
- 3D animations
- Visible guided progression

A simulation control may deliberately emit a recorded gesture-recognition result, but it must be labeled as simulated or replayed.

This is essential to demonstrate the whole workflow even without a complete trained dataset.

## TRAINING MODE

Collect real samples.

Train the classifier.

Inspect results.

Test live predictions.

Never confuse the three modes in audit records.

---

# 29. PRIVACY AND DATA SAFETY

Process webcam frames locally whenever possible.

Do not transmit raw frames to Vercel functions or external services.

Do not request microphone access merely to provide text-to-speech instructions.

Use mock patient information.

Avoid collecting identifiable real patient data.

Store:
- Anonymous session identifiers
- Technique labels
- Timestamps
- Movement evidence
- Local training samples
- Model metadata

Add:
- Clear camera-use notice
- Delete local session history
- Delete training samples
- Delete trained models
- Reset demonstration data
- Export personal training data

Use no unnecessary trackers.

Sanitize imported JSON files.

Do not execute arbitrary code from imported datasets.

---

# 30. GAMIFIED SESSION SUMMARY

Create a beautiful summary screen.

Show:

**HYGIENE SESSION COMPLETE**

Include:
- Method used
- Session duration
- Six-movement completion timeline
- Recognition evidence
- Manual confirmations
- Uncertain steps
- Experimental technique score
- XP earned
- Achievement badges

Create a six-segment radial or circular movement summary.

Allow expanding each movement for detailed evidence.

Buttons:
- Retry
- Practice Weakest Step
- Return to Hospital
- View Analytics
- Start Another Session

Clearly communicate whether the completion was:
- ML-observed
- Trainer-confirmed
- Self-reported
- Simulation-generated

Do not display "Germ-free hands verified."

---

# 31. SOUND AND MOTION DESIGN

Use subtle auditory and visual feedback.

Examples:

Movement detected:
Soft confirmation tone.

Step accepted:
Short positive chime.

Tracking lost:
Subtle alert sound.

Incomplete step:
Non-punitive corrective message.

Completion:
Brief celebratory sound.

Provide a global sound mute toggle.

Ensure the application is usable without sound.

Avoid flashing visuals and aggressive animation.

---

# 32. ACCESSIBILITY AND DEVICE SUPPORT

Support:
- Desktop Chrome
- Desktop Edge
- Modern mobile browsers where practical
- Touchscreen kiosk interactions
- Keyboard navigation
- Readable text
- High contrast
- Reduced motion
- Camera permission errors
- Devices without webcams
- WebGL-disabled browsers

Offer low-performance mode.

The primary demonstration should be optimized for a desktop laptop with an external or integrated webcam.

Ensure the split-screen guidance interface looks excellent at 1920×1080.

At narrower widths, allow stacking or tab switching between webcam and 3D reference without losing the session.

---

# 33. STATE MANAGEMENT AND DATA ARCHITECTURE

Use Zustand for application-wide state.

Separate stores by responsibility:

- ApplicationStore
- CameraStore
- GestureStore
- HygieneSessionStore
- SimulationStore
- HospitalStore
- GamificationStore
- DeviceStore
- SettingsStore

Use pure reducers or a typed state machine for workflow transitions.

Never update session progression directly from arbitrary UI components.

Use a central event dispatcher.

Suggested event types:

```ts
type HygieneEvent =
  | { type: "SESSION_STARTED"; sessionId: string }
  | { type: "HANDS_DETECTED"; count: number }
  | { type: "TRACKING_LOST" }
  | { type: "GESTURE_CANDIDATE"; gesture: string }
  | { type: "GESTURE_ACCEPTED"; stepId: string }
  | { type: "STEP_COMPLETED"; stepId: string }
  | { type: "USER_CONFIRMATION"; stepId: string }
  | { type: "DISPENSER_ACTIVATED"; deviceId: string }
  | { type: "RINSE_CONFIRMED"; source: string }
  | { type: "DRYING_CONFIRMED"; source: string }
  | { type: "SESSION_COMPLETED"; sessionId: string }
  | { type: "SESSION_INTERRUPTED"; sessionId: string };
```

Persist session records in IndexedDB.

Use a consistent clock abstraction.

Simulation speed must not accidentally alter real webcam frame timestamps.

Never award XP twice for the same event.

Make state transitions deterministic and testable.

---

# 34. PROJECT DIRECTORY STRUCTURE

Use a clean structure such as:

```text
hygienex-ai/
├── public/
│   ├── models/
│   │   ├── mediapipe/
│   │   └── gesture-classifier/
│   ├── assets/
│   │   ├── hands/
│   │   ├── hospital/
│   │   ├── characters/
│   │   ├── textures/
│   │   └── audio/
│   └── icons/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   ├── navigation/
│   │   ├── camera/
│   │   ├── guidance/
│   │   ├── gamification/
│   │   ├── dashboard/
│   │   └── three/
│   ├── pages/
│   ├── scenes/
│   │   ├── HospitalScene/
│   │   ├── GeneralWardScene/
│   │   ├── ICUScene/
│   │   └── HygieneStationScene/
│   ├── animations/
│   │   └── hand-techniques/
│   ├── cv/
│   ├── ml/
│   ├── workflows/
│   ├── simulation/
│   ├── gamification/
│   ├── services/
│   ├── storage/
│   ├── stores/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── tests/
├── ml-training/
├── scripts/
├── docs/
│   └── references/
├── e2e/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json
├── .gitignore
├── README.md
├── DEPLOY_VERCEL.md
├── ML_ARCHITECTURE.md
├── MODEL_EVALUATION.md
├── ASSET_LICENSES.md
├── TEST_REPORT.md
└── .env.example
```

The exact structure may vary if a better modular organization is justified.

No absolute local file paths should be required at runtime.

---

# 35. 3D PERFORMANCE OPTIMIZATION

Optimize:
- Geometry count
- Material count
- Draw calls
- Texture size
- Scene lighting
- Shadow maps
- Animation loops
- Memory allocation

Prefer GLB assets.

Use glTF compression where supported.

Use texture compression where practical.

Lazy-load hospital scenes independently of the core hygiene station.

Avoid downloading the entire hospital model merely to open the webcam guidance screen.

Optimize reference hands carefully because they are continuously animated.

Dispose:
- Geometries
- Materials
- Render targets
- Event listeners
- Camera tracks
- Animation mixers

Use React profiling and browser performance tools.

Provide a Performance Mode switch.

Do not guarantee unsupported frame-rate or recognition-latency figures.

---

# 36. TESTING — IMPORTANT

Implement real automated tests.

## Unit tests

Test:
- Hygiene state transitions
- Correct movement progression
- Incorrect movement rejection
- Bilateral phase tracking
- Tracking-loss pause
- Manual confirmation labeling
- Session scoring
- XP calculations
- Simulator events
- Evidence-source classification

## Computer vision tests

Use recorded or synthetic landmark fixtures for deterministic tests.

Test:
- Landmark normalization
- Handedness handling
- Temporal buffering
- Missing hand behavior
- Tracking instability
- Motion feature extraction

Synthetic fixtures may test software logic, but must not be used to claim real-world recognition accuracy.

## ML tests

Test:
- Training dataset validation
- Feature tensor shape
- Save and reload model
- Inference input handling
- Unknown class handling
- Model-unavailable behavior
- Evaluation calculations

## UI tests

Test:
- Choose Handwash
- Choose Sanitizer
- Start camera
- Stop camera
- Switch technique
- Show 3D reference
- Replay animation
- Open scenario
- Run simulation
- View dashboard
- Reset application

## End-to-end tests

Use Playwright.

Automate:
1. Open landing page.
2. Enter hospital.
3. Open hygiene station.
4. Start Handwash.
5. Use controlled test observations.
6. Validate workflow transitions.
7. Finish the session using correct evidence.
8. Check session history.
9. Refresh the page.
10. Verify persisted history.
11. Navigate directly to a nested route.

For webcam testing, use supported browser fake-media input or mocks.

Do not confuse simulated test evidence with live ML performance.

---

# 37. VERCEL PRODUCTION VERIFICATION

Before declaring the project complete, execute:

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```

Run Playwright tests if its browser dependencies are available.

Use `npm run preview` to test the production build locally.

Verify:
- No missing imports
- No TypeScript errors
- No broken route paths
- No hardcoded localhost URLs
- No unexpected backend dependencies
- No missing model files
- No missing WASM files
- No missing GLB files
- No broken static asset paths
- No unused API keys
- No paid API requirements
- No accidental deployment calls

If necessary, inspect and correct the built `dist` output.

Ensure production model/asset requests return real files rather than the SPA HTML fallback.

Test browser refresh on nested routes.

Add loading and error messages for unavailable optional assets.

---

# 38. DEPLOYMENT DOCUMENTATION

Create `DEPLOY_VERCEL.md`.

Explain:

1. How to run locally.
2. How to install dependencies.
3. How to build.
4. How to test production preview.
5. How to import the project into Vercel manually.
6. Which framework preset to select.
7. Which build command to use.
8. Which output directory to use.
9. How to test webcam permission on HTTPS.
10. How to verify MediaPipe model loading.
11. How to verify TensorFlow.js model loading.
12. How to verify 3D assets.
13. How to check browser console errors.
14. How to use Simulation Mode without a camera.
15. How to import a previously trained gesture model.
16. How to recover from IndexedDB clearing.
17. Known browser and hardware limitations.

Do not deploy.

Do not create credentials.

Do not ask for the user's Vercel token.

The project must be eligible for a manual Vercel deployment when development is complete.

---

# 39. IMPLEMENTATION PRIORITIES

Build incrementally.

Do not attempt every visual detail before establishing the core interaction.

## MILESTONE 1 — FOUNDATION

Create the full project structure and design system.

Implement navigation and persistent application state.

Build the primary station layout.

## MILESTONE 2 — LIVE HAND TRACKING

Implement the real webcam.

Integrate MediaPipe.

Show reliable landmark overlays.

Test two-hand detection.

## MILESTONE 3 — REALISTIC 3D GUIDANCE

Implement a working articulated hand-pair model.

Build all six distinct animations.

Add camera/viewer controls.

Integrate the animation with the current step.

## MILESTONE 4 — INTERACTIVE WORKFLOW

Implement Handwash and Sanitizer state machines.

Implement all preparation, rubbing and final steps.

Add corrective feedback and evidence records.

## MILESTONE 5 — MACHINE LEARNING

Implement temporal features.

Build the sample collection interface.

Train and evaluate the classifier.

Integrate actual inference.

Add uncertainty handling.

## MILESTONE 6 — GAMIFICATION

Implement XP, levels, challenges, badges and session summaries.

Connect achievement logic to real or explicitly simulated events.

## MILESTONE 7 — IMMERSIVE HOSPITAL

Build the 3D hospital and clickable hygiene station.

Connect patient/ward scenarios to the workflow engine.

## MILESTONE 8 — DASHBOARD AND DEVICE SIMULATION

Implement General Ward, ICU, analytics, audit and device state.

## MILESTONE 9 — PRODUCTION READINESS

Optimize assets.

Fix errors.

Run automated tests.

Verify the production build.

Prepare Vercel documentation.

At every milestone, keep the application runnable.

If execution is constrained, finish and test the highest-priority core functionality before secondary visual enhancements.

---

# 40. NON-NEGOTIABLE ACCEPTANCE CRITERIA

The project is considered genuinely functional only if:

### Live tracking

- A real webcam feed works.
- Real hand landmarks are displayed.
- Both hands can be tracked when visible.
- Webcam resources are released correctly.
- Camera failure does not crash the app.

### 3D reference

- Two recognizable 3D hands appear.
- All six animations are implemented.
- Each animation is visibly different.
- Bilateral movements are represented.
- The 3D viewer is interactive.
- Animations synchronize with the active workflow step.

### ML recognition

- Temporal landmark features are calculated.
- Training samples can be recorded.
- A real classifier can be trained.
- A saved model can be loaded.
- Live inference uses actual model outputs.
- Recognition uncertainty is represented.
- Invalid movements do not automatically pass.
- A missing trained model never produces fabricated predictions.

### Hygiene workflow

- Handwash and Sanitizer are distinct.
- Steps occur in the correct sequence.
- Correct movement evidence advances a step.
- Incomplete movement stays on the current step.
- Tracking loss pauses validation.
- Handwashing includes rinse and drying.
- Sanitizer ends with natural drying.
- Completion evidence is stored.

### Gamification

- XP is calculated from session events.
- Levels and achievements work.
- Scenarios have interactive outcomes.
- Training progress persists.

### Hospital simulation

- 3D hospital is interactive.
- Hygiene stations are clickable.
- General Ward workflows execute.
- ICU workflows execute.
- Simulation events update dashboards.

### Deployment

- `npm run build` succeeds.
- Static output exists.
- Nested routes resolve.
- Production asset paths work.
- No mandatory paid cloud dependency exists.
- No Vercel deployment was performed.

---

# 41. FINAL QUALITY STANDARD

The application must look and behave like an advanced scientific training product.

The signature demonstration is:

**A user stands in front of their webcam, sees their real hands being tracked, watches anatomically realistic animated 3D hands perform the required technique, copies the movement, receives evidence-based feedback and progresses through an interactive procedure.**

The simulated hospital should provide an immersive real-world context for this experience.

The highest priorities are:

1. Genuine working computer vision
2. Accurate and distinguishable 3D instructional animations
3. Technically honest gesture validation
4. Correct hand-hygiene workflow logic
5. Smooth UI and 3D interaction
6. Engaging scenario-based gamification
7. Vercel-ready static deployment
8. Clear documentation and testing

Prioritize implementation correctness over fake polish.

Do not replace difficult requirements with mockups without stating the limitation.

Do not hide failing functionality behind decorative interfaces.

Do not claim clinical accuracy or sterility detection without evidence.

The entire application must remain usable in guided demo mode when a custom gesture model is still being trained.

---

# 42. FINAL CODEX EXECUTION INSTRUCTIONS

START BUILDING NOW.

First inspect the existing repository and supplied reference assets.

If the repository is empty, initialize the project.

Create a concise implementation plan in the repository, then execute it.

Write real source files.

Install dependencies.

Implement the webcam tracking and reference-hand viewer as the foundation.

Complete the procedure state machines.

Implement ML data collection, training and inference.

Add the gamified hospital experience.

Connect all pages to shared application state.

Run local verification commands.

Fix the errors found.

Repeat verification.

Do not deploy.

At the very end, provide:

**IMPLEMENTATION REPORT**

A. Features fully implemented and tested  
B. Features implemented but requiring user-trained model data  
C. Features operating in explicitly labeled simulation mode  
D. Features requiring physical hardware  
E. Tests run and their actual results  
F. Production build status  
G. Manual Vercel deployment instructions  
H. Known technical limitations  

Never invent test results.

**FINAL OBJECTIVE:**

Deliver a premium, visually impressive, interactive, gamified, browser-based HYGIENEX AI application featuring real hand tracking, realistic 3D technique guidance, trainable movement verification, medical scenario simulation and correct deployment-ready source code.

The user must be able to manually deploy the completed application on Vercel without requiring a paid ML inference server.

DO NOT AUTO-DEPLOY.

BEGIN IMPLEMENTATION.