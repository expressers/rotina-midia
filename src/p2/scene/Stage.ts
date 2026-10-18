import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { coronaFragment, coronaVertex, dustFragment, dustVertex, frameFragment, frameVertex, gradeShader } from './shaders'
import { ECLIPSE_END_Z, FILM_X, FILM_Z, FILMS, T } from '../story'

const MARK_PATH =
  'M237.78,128.41v343.17c-69.43-26.06-118.81-93.09-118.81-171.6s49.38-145.51,118.81-171.57ZM39.78,300c0,48.56,20.58,92.34,53.5,123.04v-246.09c-32.91,30.71-53.5,74.48-53.5,123.04Z'
const CIRCLE = { x: 510.47, y: 300, r: 249.75 }
const BRAND_RED = new THREE.Color(0.75, 0.031, 0.067)

type V3 = [number, number, number]
type Station = { t: number; pos: V3; look: V3 }
type Screen = { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; near: number; far: number; on: number; wake: number }

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const hold = (f: number, h = 0.2) => smooth(h, 1 - h, f)

const ROTINA_IMAGES = [
  'candongueiro',
  'dioguito',
  'entranazona-festa',
  'natal-bai-equipa',
  'barco',
  'filda',
  'casamento',
  'angotic',
  'bai',
  'back2black-retrato',
]
const LUANDA_TILES = ['candongueiro', 'dioguito', 'bai', 'filda', 'angotic', 'entranazona-mesa', 'natal-bai', 'africell', 'entranazona-retrato']
const SP_TILES = ['jovens-embaixadores', 'casamento', 'barco', 'bastidores', 'back2black-retrato', 'entranazona-festa', 'natal-bai-equipa', 'candongueiro', 'dioguito']

export class Stage {
  readonly renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private composer: EffectComposer
  private bloom: UnrealBloomPass
  private grade: ShaderPass
  private t0 = performance.now()
  private last = performance.now()
  private loader: THREE.TextureLoader
  private textures = new Map<string, THREE.Texture>()
  private screens: Screen[] = []
  private stations: Station[] = []
  private posCurve!: THREE.CatmullRomCurve3
  private lookCurve!: THREE.CatmullRomCurve3
  private logo = new THREE.Group()
  private slices: THREE.Mesh[] = []
  private coronas: THREE.ShaderMaterial[] = []
  private coronaMeshes: THREE.Mesh[] = []
  private fold = new THREE.Group()
  private dust!: THREE.Points
  private dustMat!: THREE.ShaderMaterial
  private raf = 0
  private running = false
  private mobile: boolean
  private mouse = new THREE.Vector2()
  private mouseS = new THREE.Vector2()
  private camPos = new THREE.Vector3()
  private camLook = new THREE.Vector3()

  /** Journey progress 0..1, set from scroll. */
  progress = 0
  /** Opening sequence 0..1, set by the intro timeline. */
  intro = 0

  constructor(private canvas: HTMLCanvasElement, onLoad: (p: number) => void, onReady: () => void) {
    this.mobile = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.mobile ? 1.3 : 1.75))
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.toneMapping = THREE.NoToneMapping
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400)
    this.scene.fog = null

    const manager = new THREE.LoadingManager()
    manager.onProgress = (_u, loaded, total) => onLoad(loaded / total)
    manager.onLoad = () => onReady()
    this.loader = new THREE.TextureLoader(manager)

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 1.1, 0.75, 0.82)
    this.composer.addPass(this.bloom)
    this.grade = new ShaderPass(gradeShader)
    this.composer.addPass(this.grade)
    this.composer.addPass(new OutputPass())

    this.buildLogo()
    this.buildRotina()
    this.buildOlhar()
    this.buildFilms()
    this.buildFold()
    this.buildEnd()
    this.buildDust()
    this.resize()
  }

  // ---------- building ----------

  private tex(name: string, w: 720 | 1280 = 720) {
    const key = `${name}-${w}`
    let t = this.textures.get(key)
    if (!t) {
      t = this.loader.load(`/img/${key}.webp`)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
      t.generateMipmaps = true
      t.minFilter = THREE.LinearMipmapLinearFilter
      this.textures.set(key, t)
    }
    return t
  }

  private screen(name: string, w: number, aspect: number, opts: { near: number; far: number; wake: number; res?: 720 | 1280; seed?: number }) {
    const h = w / aspect
    const mat = new THREE.ShaderMaterial({
      vertexShader: frameVertex,
      fragmentShader: frameFragment,
      uniforms: {
        map: { value: this.tex(name, opts.res ?? 720) },
        uOn: { value: 0 },
        uFocus: { value: 0 },
        uTime: { value: 0 },
        uSeed: { value: opts.seed ?? Math.random() },
        uCover: { value: new THREE.Vector2(1, 1) },
      },
      side: THREE.DoubleSide,
    })
    // Image is 16:9; screens with other aspects crop like object-fit: cover.
    const imgAspect = name.includes('scope') ? 2.39 : 16 / 9
    const cover = new THREE.Vector2(1, 1)
    if (aspect > imgAspect) cover.set(1, imgAspect / aspect)
    else cover.set(aspect / imgAspect, 1)
    mat.uniforms.uCover.value = cover
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
    this.screens.push({ mesh, mat, near: opts.near, far: opts.far, on: 0, wake: opts.wake })
    return mesh
  }

  private buildLogo() {
    const s = 1 / 100
    const shapes = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${MARK_PATH}"/></svg>`).paths[0].toShapes()
    shapes.forEach((shape, i) => {
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 18, bevelEnabled: true, bevelThickness: 3, bevelSize: 2, bevelSegments: 3, curveSegments: 24 })
      geo.translate(-CIRCLE.x, -CIRCLE.y, -9)
      geo.scale(s, -s, s)
      const mat = new THREE.MeshBasicMaterial({ color: BRAND_RED.clone().multiplyScalar(i === 0 ? 1.35 : 1.8), transparent: true, opacity: 0, toneMapped: false })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.userData.rest = new THREE.Vector3(0, 0, 0)
      this.slices.push(mesh)
      this.logo.add(mesh)
    })
    this.logo.add(this.eclipse(CIRCLE.r * s))
    this.scene.add(this.logo)
  }

  private eclipse(r: number) {
    const g = new THREE.Group()
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32), new THREE.MeshBasicMaterial({ color: 0x000000 }))
    g.add(sphere)
    const mat = new THREE.ShaderMaterial({
      vertexShader: coronaVertex,
      fragmentShader: coronaFragment,
      uniforms: { uIgnite: { value: 0 }, uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const corona = new THREE.Mesh(new THREE.PlaneGeometry(r * 4, r * 4), mat)
    corona.renderOrder = 2
    g.add(corona)
    this.coronas.push(mat)
    this.coronaMeshes.push(corona)
    return g
  }

  private buildRotina() {
    // Everyday frames hung along both sides of the corridor, angled toward the path.
    ROTINA_IMAGES.forEach((name, i) => {
      const side = i % 2 === 0 ? -1 : 1
      const z = -13 - i * 3.1
      const m = this.screen(name, 2.7, 16 / 9, { near: 4.5, far: 15, wake: 20, seed: i / 10 })
      m.position.set(side * (2.5 + (i % 3) * 0.35), Math.sin(i * 1.7) * 0.7, z)
      m.rotation.y = -side * 0.55
      this.scene.add(m)
    })
  }

  private buildOlhar() {
    const m = this.screen('bastidores', 7.2, 16 / 9, { near: 7, far: 18, wake: 16, res: 1280, seed: 0.3 })
    m.position.set(0, 0, -50)
    this.scene.add(m)
  }

  private buildFilms() {
    FILMS.forEach((f, i) => {
      const scope = !!f.scope
      const m = this.screen(f.image, 8.6, scope ? 2.39 : 16 / 9, { near: 8.5, far: 22, wake: 20, res: 1280, seed: i / 5 })
      m.position.set(FILM_X[i], scope ? 0.2 : 0, FILM_Z[i])
      m.rotation.y = FILM_X[i] < 0 ? 0.16 : -0.16
      m.userData.film = i
      this.scene.add(m)
    })
  }

  private buildFold() {
    // Luanda lies on the floor; São Paulo is hinged at the far end and folds up and over into the ceiling.
    const cols = 3
    const w = 3.3
    const h = w / (16 / 9)
    const gap = 0.25
    const floorY = -2.6
    const start = -118
    LUANDA_TILES.forEach((name, i) => {
      const c = i % cols
      const r = Math.floor(i / cols)
      const m = this.screen(name, w, 16 / 9, { near: 6, far: 18, wake: 24, seed: i / 9 })
      m.rotation.x = -Math.PI / 2
      m.position.set((c - 1) * (w + gap), floorY, start - r * (h + gap) - h / 2)
      this.scene.add(m)
    })
    const hingeZ = start - 3 * (h + gap)
    this.fold.position.set(0, 0, hingeZ)
    SP_TILES.forEach((name, i) => {
      const c = i % cols
      const r = Math.floor(i / cols)
      const m = this.screen(name, w, 16 / 9, { near: 6, far: 18, wake: 26, seed: 0.5 + i / 9 })
      m.rotation.x = -Math.PI / 2
      m.position.set((c - 1) * (w + gap), floorY, -(r * (h + gap) + h / 2))
      this.fold.add(m)
    })
    this.scene.add(this.fold)
  }

  private buildEnd() {
    const e = this.eclipse((CIRCLE.r / 100) * 1.4)
    e.position.set(0, 0, ECLIPSE_END_Z)
    this.scene.add(e)
  }

  private buildDust() {
    const n = this.mobile ? 500 : 1400
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9
      pos[i * 3 + 2] = 16 - Math.random() * 215
      seed[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    this.dustMat = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: { uTime: { value: 0 }, uSize: { value: this.mobile ? 2.2 : 2.6 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    this.dust = new THREE.Points(geo, this.dustMat)
    this.scene.add(this.dust)
  }

  /** Camera stations. Portrait screens pull the camera back so the big screens still read. */
  private buildPath() {
    const a = this.camera.aspect
    const back = Math.min(2.1, Math.max(1, 1.3 / a))
    // Portrait: face each screen square-on so the whole frame fits the narrow view.
    const portrait = a < 0.8
    const films: Station[] = FILMS.map((_, i) => ({
      t: T.films[i],
      pos: [FILM_X[i] * (portrait ? 1.05 : 0.45), 0, FILM_Z[i] + (portrait ? 8.6 : 7.4 * back)],
      look: [FILM_X[i] * (portrait ? 1.05 : 0.95), 0, FILM_Z[i]],
    }))
    this.stations = [
      { t: T.intro, pos: [0, 0, 13 * Math.min(back, 1.6)], look: [0, 0, 0] },
      { t: T.enter, pos: [0, 0, 3.4], look: [0, 0, -6] },
      { t: T.through, pos: [0, 0.1, -5], look: [0, 0, -16] },
      { t: T.rotina, pos: [0, 0.25, -19], look: [0, 0, -30] },
      { t: T.rotina2, pos: [0, 0, -34], look: [0, 0, -46] },
      { t: T.olhar, pos: [0, 0, -50 + 8.2 * back], look: [0, 0, -50] },
      ...films,
      { t: T.luanda, pos: [0, 1.6, -113], look: [0, -2.6, -121] },
      { t: T.saoPaulo, pos: [0, -1.4, -129], look: [0, 2.6, -121.5] },
      { t: T.vozes[0], pos: [0, 0, -150], look: [0, 0, -170] },
      { t: T.vozes[3], pos: [0, 0, -166], look: [0, 0, -186] },
      { t: T.fim, pos: [0, 0, ECLIPSE_END_Z + 14 * Math.min(back, 1.5)], look: [0, 0, ECLIPSE_END_Z] },
      { t: T.end, pos: [0, 0, ECLIPSE_END_Z + 12.5 * Math.min(back, 1.5)], look: [0, 0, ECLIPSE_END_Z] },
    ]
    this.posCurve = new THREE.CatmullRomCurve3(this.stations.map((s) => new THREE.Vector3(...s.pos)), false, 'centripetal')
    this.lookCurve = new THREE.CatmullRomCurve3(this.stations.map((s) => new THREE.Vector3(...s.look)), false, 'centripetal')
  }

  // ---------- runtime ----------

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.renderer.setSize(w, h, false)
    this.composer.setSize(w, h)
    this.bloom.resolution.set(w / (this.mobile ? 3 : 2), h / (this.mobile ? 3 : 2))
    this.camera.aspect = w / h
    this.camera.fov = this.camera.aspect < 0.8 ? 62 : 42
    this.camera.updateProjectionMatrix()
    const portrait = this.camera.aspect < 0.8
    this.screens.forEach((sc) => {
      const i = sc.mesh.userData.film as number | undefined
      if (i === undefined) return
      sc.mesh.rotation.y = portrait ? 0 : FILM_X[i] < 0 ? 0.16 : -0.16
      sc.mesh.scale.setScalar(portrait ? 0.56 : 1)
    })
    this.buildPath()
  }

  pointer(x: number, y: number) {
    this.mouse.set(x, y)
  }

  private cameraAt(t: number) {
    const s = this.stations
    let i = 0
    while (i < s.length - 2 && t >= s[i + 1].t) i++
    const f = (t - s[i].t) / Math.max(1e-6, s[i + 1].t - s[i].t)
    const u = (i + hold(Math.min(1, Math.max(0, f)))) / (s.length - 1)
    this.posCurve.getPoint(u, this.camPos)
    this.lookCurve.getPoint(u, this.camLook)
  }

  private frame = () => {
    this.raf = requestAnimationFrame(this.frame)
    const now = performance.now()
    const time = (now - this.t0) / 1000
    const dt = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    const p = this.progress
    const intro = this.intro

    // Camera.
    this.cameraAt(p)
    if (p < 0.02) this.camPos.z += (1 - intro) * 6 // pull-in during the opening
    this.mouseS.lerp(this.mouse, 0.04)
    const drift = this.mobile ? 0 : 1
    this.camera.position.set(
      this.camPos.x + this.mouseS.x * 0.35 * drift + Math.sin(time * 0.31) * 0.04,
      this.camPos.y + this.mouseS.y * 0.22 * drift + Math.sin(time * 0.23) * 0.03,
      this.camPos.z,
    )
    this.camera.lookAt(this.camLook)

    // Opening: the slices are the mark's motion trail, they catch up with the eclipse.
    this.slices.forEach((m, i) => {
      const k = smooth(0.18 + i * 0.12, 0.72 + i * 0.08, intro)
      m.position.set(-9 * (1 - k) * (1 + i * 0.4), 0, -7 * (1 - k))
      ;(m.material as THREE.MeshBasicMaterial).opacity = k
    })
    this.coronas[0].uniforms.uIgnite.value = smooth(0.05, 0.6, intro) * (1 + 0.25 * smooth(0.55, 0.75, intro) * (1 - smooth(0.75, 1, intro)))
    this.coronas[1].uniforms.uIgnite.value = 0.25 + 0.75 * smooth(T.vozes[2], T.fim, p)
    this.coronas.forEach((c) => (c.uniforms.uTime.value = time))
    this.coronaMeshes.forEach((m) => m.quaternion.copy(this.camera.quaternion))
    this.logo.visible = this.camera.position.z > -2

    // The cut: a white flash as the camera passes through the eclipse.
    const z = this.camera.position.z
    const flash = Math.max(0, 1 - Math.abs(z - 0.2) / 2.4)
    this.grade.uniforms.uFlash.value = Math.pow(flash, 2.2) * 0.95
    this.grade.uniforms.uFade.value = smooth(0, 0.35, intro)
    this.grade.uniforms.uTime.value = time

    // Inception fold.
    this.fold.rotation.x = Math.PI * smooth(T.luanda + 0.01, T.saoPaulo - 0.005, p)

    // Screens: power on as the camera approaches, come into focus when near.
    const wp = new THREE.Vector3()
    for (const s of this.screens) {
      s.mesh.getWorldPosition(wp)
      const d = wp.distanceTo(this.camera.position)
      const ahead = wp.z < this.camera.position.z + 2
      if (ahead && d < s.wake) s.on = Math.min(1, s.on + dt * 1.5)
      s.mat.uniforms.uOn.value = s.on
      s.mat.uniforms.uFocus.value = 1 - smooth(s.near, s.far, d)
      s.mat.uniforms.uTime.value = time
      s.mesh.visible = d < 60
    }

    this.dustMat.uniforms.uTime.value = time
    this.composer.render()
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    this.frame()
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  dispose() {
    this.stop()
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mat = m.material as THREE.Material | undefined
      mat?.dispose?.()
    })
    this.textures.forEach((t) => t.dispose())
    this.composer.dispose()
    this.renderer.dispose()
  }
}
