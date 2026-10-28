# Asset origins and licenses

| Asset                                                       | Origin                                                                       | License / status                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `public/models/hand_landmarker.task`                        | Official Google MediaPipe float16 version 1 bundle                           | Apache-2.0; Google MediaPipe                                           |
| `public/models/mediapipe/wasm/*`                            | Copied from installed `@mediapipe/tasks-vision` 1.1.1                        | Apache-2.0; shipped version matches package lock                       |
| Bundled Inter Latin font subsets                            | `@fontsource/inter` 5.3.0; Inter by Rasmus Andersson                         | SIL Open Font License 1.1, text in `public/licenses/Inter-OFL.txt`     |
| Interface icons                                             | `lucide-react`                                                               | ISC; package license retained in dependency                            |
| Anatomical left/right hand meshes                           | `@webxr-input-profiles/assets` generic-hand profile; Meta-contributed meshes | MIT; package license in `public/licenses/WebXR-Input-Profiles-MIT.txt` |
| Kiosk, doctor, fluid effects, and animation choreography | Original procedural Three.js geometry in this repository                     | Created for this project                                               |
| Workflow infographic                                        | User-provided reference image                                                | User-provided; preserved in docs, not displayed as product art         |

Official model URL:
https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task

Size: **7,819,105 bytes**.

SHA-256:
`fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`

MediaPipe official model card and Apache license context:
https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20%28Lite_Full%29%20with%20Fairness%20Oct%202021.pdf

Official license copied to `public/licenses/MediaPipe-Apache-2.0.txt`:
https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE

Technique sequence references (not an endorsement of this prototype):

- https://www.who.int/publications/m/item/how-to-handwash
- https://www.who.int/publications/m/item/how-to-handrub

No external GLB, audio, stock image, or custom gesture weight asset is hotlinked or fabricated. No asset retrieval is needed at runtime outside the hosted origin.

## Anatomical hand meshes

Downloaded and bundled locally from:

- https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/left.glb
- https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/right.glb

The upstream source and asset-specific MIT license:

- https://github.com/immersive-web/webxr-input-profiles/tree/main/packages/assets/profiles/generic-hand
- https://github.com/immersive-web/webxr-input-profiles/blob/main/packages/assets/LICENSE.md

Left hand: 94,572 bytes; SHA-256 `bc67783144944ea1cda54d9247885825ea5fb9d4651469fe7d00be517a5c2b87`.

Right hand: 94,004 bytes; SHA-256 `291790c14f7f88a7f9bd35330c47392ed8e8d395ae6728f4bb7089f1bc1f2b96`.

Mesh files are unmodified. At runtime the app clones the skeleton, reparents WebXR joint nodes into anatomical chains while preserving their rest transforms, normalizes orientation/scale, applies custom skin materials, and animates joints with original teaching loops. These adaptations do not imply clinician validation.

