import { Component, type ReactNode } from 'react';
export class SceneBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        {this.props.fallback ??
          '3D rendering is unavailable. Use the written technique guidance below.'}
      </div>
    ) : (
      this.props.children
    );
  }
}
