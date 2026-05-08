/* ============================================================
 * SKELETON — 2D cutout animation
 * See ABANDONED_PARK_PLAN.md → "CHARACTER ANIMATION SYSTEM."
 * A character is a tree of bones with local transforms; world
 * transforms cascade down. Animator lerps between keyframes
 * each frame and pushes the resulting pose onto the Skeleton.
 *
 *   const rig = new Skeleton(definition);
 *   const anim = new Animator(rig, animLibrary);
 *   anim.play('idle');
 *   // each frame: anim.update(dt); rig.getAllTransforms();
 * ============================================================ */

const lerp = (a, b, u) => a + (b - a) * u;

// -- Skeleton -------------------------------------------------
// Holds the bone hierarchy and the current pose. Pure data —
// no animation logic lives here.
export class Skeleton {
  // Build a flat Map<name, bone> from a nested rig definition.
  // Each bone tracks its default (rest) transform so reset() can
  // restore it before the Animator overwrites it each frame.
  constructor(definition) {
    this.bones = new Map();
    this.rootName = definition.name;
    this._walk(definition, null);
  }

  _walk(def, parentName) {
    const bone = {
      name: def.name,
      parent: parentName,
      defaultX: def.x || 0,
      defaultY: def.y || 0,
      defaultRotation: def.rotation || 0,
      x: def.x || 0,
      y: def.y || 0,
      rotation: def.rotation || 0,
    };
    this.bones.set(def.name, bone);
    if (def.children) {
      for (const child of def.children) this._walk(child, def.name);
    }
  }

  // Snap every bone back to its rest transform from the rig def.
  // The Animator calls this before applying the current frame's
  // pose so unanimated bones stay put instead of drifting.
  reset() {
    for (const bone of this.bones.values()) {
      bone.x = bone.defaultX;
      bone.y = bone.defaultY;
      bone.rotation = bone.defaultRotation;
    }
  }

  // Overwrite local transform on the bones named in `pose`.
  // Pose shape: { boneName: { rotation?, x?, y? }, ... }
  // Bones not in the pose are left untouched, missing fields
  // are left at whatever value reset() / a prior pose set them to.
  applyPose(pose) {
    for (const name in pose) {
      const bone = this.bones.get(name);
      if (!bone) continue;
      const set = pose[name];
      if ('rotation' in set) bone.rotation = set.rotation;
      if ('x' in set) bone.x = set.x;
      if ('y' in set) bone.y = set.y;
    }
  }

  // Walk up to the root, composing parent transforms into world
  // space. World rotation = sum of local rotations down the chain;
  // world position = parent.world + parent-rotated local offset.
  // Returns null if the bone doesn't exist.
  getBoneTransform(name) {
    const bone = this.bones.get(name);
    if (!bone) return null;
    if (!bone.parent) {
      return { x: bone.x, y: bone.y, rotation: bone.rotation };
    }
    const parent = this.getBoneTransform(bone.parent);
    const cos = Math.cos(parent.rotation);
    const sin = Math.sin(parent.rotation);
    return {
      x: parent.x + bone.x * cos - bone.y * sin,
      y: parent.y + bone.x * sin + bone.y * cos,
      rotation: parent.rotation + bone.rotation,
    };
  }

  // World transforms for every bone, returned as a Map<name, {x,y,rotation}>.
  // Cheap enough for ~13-bone rigs without caching parents — reuse the
  // recursive call. If we ever rig a 50-bone monster, memoize per-frame.
  getAllTransforms() {
    const result = new Map();
    for (const name of this.bones.keys()) {
      result.set(name, this.getBoneTransform(name));
    }
    return result;
  }
}

// -- Animator -------------------------------------------------
// Drives a Skeleton with a library of keyframed animations.
// Each frame: advance time, sample the pose at that time,
// reset the skeleton, push the pose. Linear lerp on rotation,
// x, and y.
export class Animator {
  constructor(skeleton, animationLibrary) {
    this.skeleton = skeleton;
    this.library = animationLibrary;
    this.currentName = null;
    this.currentAnim = null;
    this.loop = true;
    this.time = 0;
  }

  // Start an animation by name. Resets time to 0. If the name
  // isn't in the library, logs a warning and does nothing so a
  // typo in game code is loud, not silent.
  play(animName, loop = true) {
    const anim = this.library[animName];
    if (!anim) {
      console.warn(`Animator: unknown animation "${animName}"`);
      return;
    }
    this.currentName = animName;
    this.currentAnim = anim;
    this.loop = loop && (anim.loop !== false);
    this.time = 0;
  }

  // Advance time by `dt` (seconds), wrap if looping or clamp to
  // the end if not, then push the sampled pose to the skeleton.
  update(dt) {
    if (!this.currentAnim) return;
    this.time += dt;
    const dur = this.currentAnim.duration;
    if (this.time >= dur) {
      if (this.loop) this.time = dur > 0 ? this.time % dur : 0;
      else this.time = dur;
    }
    this.skeleton.reset();
    const pose = this._sampleAt(this.time);
    this.skeleton.applyPose(pose);
  }

  getCurrentAnimation() {
    return this.currentName;
  }

  isPlaying(animName) {
    return this.currentName === animName;
  }

  // Build the pose at time `t` by lerping each bone independently.
  // A bone may not appear in every keyframe — we find the nearest
  // surrounding keyframes that DO mention it and lerp between those.
  // Bones never mentioned in any keyframe stay at rest (skeleton.reset).
  _sampleAt(t) {
    const result = {};
    const allBones = new Set();
    for (const kf of this.currentAnim.keyframes) {
      for (const bone in kf.pose) allBones.add(bone);
    }

    for (const bone of allBones) {
      // Keyframes that touch this specific bone, in time order.
      const relevant = this.currentAnim.keyframes.filter(kf => kf.pose[bone]);
      if (relevant.length === 0) continue;

      let prev = null;
      let next = null;
      for (const kf of relevant) {
        if (kf.time <= t) prev = kf;
        else { next = kf; break; }
      }
      // Before first or after last → hold the nearest endpoint.
      if (!prev) prev = next;
      if (!next) next = prev;

      const a = prev.pose[bone];
      const b = next.pose[bone];
      const span = next.time - prev.time;
      const u = span > 0 ? (t - prev.time) / span : 0;

      const out = {};
      if ('rotation' in a || 'rotation' in b) {
        out.rotation = lerp(a.rotation ?? 0, b.rotation ?? 0, u);
      }
      if ('x' in a || 'x' in b) out.x = lerp(a.x ?? 0, b.x ?? 0, u);
      if ('y' in a || 'y' in b) out.y = lerp(a.y ?? 0, b.y ?? 0, u);
      result[bone] = out;
    }
    return result;
  }
}
