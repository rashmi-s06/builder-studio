import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import './App.css'

const APP_NAME = 'BUILDER STUDIO'

const TITLES = [
  'CHAOS ENGINEER',
  'MIDNIGHT BUILDER',
  'PIXEL NOMAD',
  'CODE ALCHEMIST',
  'CIRCUIT DREAMER',
  'SYSTEMS WANDERER',
  'PROBLEM BREAKER',
  'COCONUT COMPILER',
  'MONSOON MAKER',
  'BUG WHISPERER',
  'PROFESSIONAL OVERTHINKER',
  'SLEEP-DEPRIVED BUILDER',
  'SERIAL DEBUGGER',
  'INTERNET WITCH',
  'SHIP IT ANYWAY',
  'IDEAS WITH LEGS',
]

const THEMES = {
  classic: {
    name: 'CLASSIC',
    green: '#08713e',
    dark: '#02351f',
    pink: '#ff087d',
    cream: '#fffbea',
    ink: '#07150e',
  },

  sunset: {
    name: 'SUNSET',
    green: '#5b2b78',
    dark: '#251334',
    pink: '#ff5c35',
    cream: '#fff1dc',
    ink: '#1c1022',
  },

  electric: {
    name: 'ELECTRIC',
    green: '#075b55',
    dark: '#022c2a',
    pink: '#00d9a0',
    cream: '#effff9',
    ink: '#031b19',
  },

  mango: {
    name: 'MANGO',
    green: '#a24700',
    dark: '#4a1d00',
    pink: '#ffca28',
    cream: '#fff8df',
    ink: '#261300',
  },
}

const MODES = [
  ['profile', 'PROFILE'],
  ['builder', 'BUILDER ID'],
  ['banner', 'BANNER'],
  ['team', 'TEAM'],
]

const DEFAULT_TEAM = [
  { name: 'BUILDER ONE', role: 'ENGINEER', image: null },
  { name: 'BUILDER TWO', role: 'DESIGNER', image: null },
  { name: 'BUILDER THREE', role: 'HACKER', image: null },
  { name: 'BUILDER FOUR', role: 'MAKER', image: null },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 5000

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

function App() {
  const [mode, setMode] = useState('profile')
  const [themeName, setThemeName] = useState('classic')

  const [imageUrl, setImageUrl] = useState(null)
  const [imageName, setImageName] = useState('')

  const [zoom, setZoom] = useState(1)

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })

  const [name, setName] = useState('Rashmi')
  const [role, setRole] = useState(
    'CSE · Cyber Physical Systems'
  )

  const [title, setTitle] = useState(TITLES[0])
  const [builderId, setBuilderId] = useState('056')

  const [residency, setResidency] = useState(
    'GOA, INDIA'
  )

  const [bannerText, setBannerText] = useState(
    'BUILD SOMETHING WILD'
  )

  const [bannerSubtext, setBannerSubtext] = useState(
    'MAKE · BREAK · REBUILD'
  )

  const [teamMembers, setTeamMembers] =
    useState(DEFAULT_TEAM)

  const [isDragging, setIsDragging] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [notice, setNotice] = useState('')

  const frameRef = useRef(null)
  const stageRef = useRef(null)

  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
  })

  const theme = THEMES[themeName]

  useEffect(() => {
    if (!notice) return

    const timer = setTimeout(() => {
      setNotice('')
    }, 3000)

    return () => clearTimeout(timer)
  }, [notice])

  /*
    RESPONSIVE PREVIEW SCALE
  */

  useEffect(() => {
    const stage = stageRef.current

    if (!stage) return

    const updateScale = () => {
      const baseWidth =
        mode === 'banner' ? 720 : 540

      const baseHeight =
        mode === 'banner' ? 405 : 675

      const availableWidth =
        Math.max(stage.clientWidth - 4, 0)

      const scale = Math.min(
        1,
        availableWidth / baseWidth
      )

      stage.style.setProperty(
        '--preview-scale',
        scale
      )

      stage.style.height =
        `${baseHeight * scale}px`
    }

    updateScale()

    const observer =
      new ResizeObserver(updateScale)

    observer.observe(stage)

    return () => observer.disconnect()
  }, [mode])

  /*
    NOTIFICATIONS
  */

  const showNotice = (message) => {
    setNotice(message)
  }

  /*
    IMAGE VALIDATION
  */

  const validateAndReadImage = (
    file,
    onSuccess
  ) => {
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      showNotice(
        'Please use a JPG, PNG, or WebP image.'
      )
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      showNotice(
        'Image must be smaller than 10 MB.'
      )
      return
    }

    const objectUrl =
      URL.createObjectURL(file)

    const probe = new Image()

    probe.onload = () => {
      const valid =
        probe.width > 0 &&
        probe.height > 0 &&
        probe.width <= MAX_IMAGE_DIMENSION &&
        probe.height <= MAX_IMAGE_DIMENSION

      URL.revokeObjectURL(objectUrl)

      if (!valid) {
        showNotice(
          `Image must be smaller than ${MAX_IMAGE_DIMENSION} × ${MAX_IMAGE_DIMENSION}px.`
        )
        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        if (
          typeof reader.result === 'string'
        ) {
          onSuccess(reader.result)
        }
      }

      reader.onerror = () => {
        showNotice(
          'Could not read that image.'
        )
      }

      reader.readAsDataURL(file)
    }

    probe.onerror = () => {
      URL.revokeObjectURL(objectUrl)

      showNotice(
        'That file is not a valid image.'
      )
    }

    probe.src = objectUrl
  }

  /*
    MAIN PHOTO
  */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0]

    event.target.value = ''

    validateAndReadImage(
      file,
      (dataUrl) => {
        setImageUrl(dataUrl)
        setImageName(file.name)

        setZoom(1)

        setPosition({
          x: 0,
          y: 0,
        })
      }
    )
  }

  const clearMainPhoto = () => {
    setImageUrl(null)
    setImageName('')

    setZoom(1)

    setPosition({
      x: 0,
      y: 0,
    })
  }

  /*
    TEAM PHOTOS
  */

  const handleTeamImage = (
    index,
    event
  ) => {
    const file =
      event.target.files?.[0]

    event.target.value = ''

    validateAndReadImage(
      file,
      (dataUrl) => {
        setTeamMembers((current) =>
          current.map(
            (member, memberIndex) =>
              memberIndex === index
                ? {
                    ...member,
                    image: dataUrl,
                  }
                : member
          )
        )
      }
    )
  }

  const updateTeamMember = (
    index,
    field,
    value
  ) => {
    setTeamMembers((current) =>
      current.map(
        (member, memberIndex) =>
          memberIndex === index
            ? {
                ...member,
                [field]: value,
              }
            : member
      )
    )
  }

  const removeTeamImage = (index) => {
    setTeamMembers((current) =>
      current.map(
        (member, memberIndex) =>
          memberIndex === index
            ? {
                ...member,
                image: null,
              }
            : member
      )
    )
  }

  /*
    PHOTO CONTROLS
  */

  const resetPhoto = () => {
    setZoom(1)

    setPosition({
      x: 0,
      y: 0,
    })
  }

  const zoomIn = () => {
    setZoom((value) =>
      Math.min(
        2.4,
        Number(
          (value + 0.1).toFixed(2)
        )
      )
    )
  }

  const zoomOut = () => {
    setZoom((value) =>
      Math.max(
        0.8,
        Number(
          (value - 0.1).toFixed(2)
        )
      )
    )
  }

  /*
    RANDOM TITLE
  */

  const randomTitle = () => {
    const current =
      TITLES.indexOf(title)

    let next =
      Math.floor(
        Math.random() * TITLES.length
      )

    if (next === current) {
      next =
        (next + 1) %
        TITLES.length
    }

    setTitle(TITLES[next])
  }

  /*
    DRAG PHOTO
  */

  const handlePointerDown = (
    event
  ) => {
    if (!imageUrl) return

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosX: position.x,
      startPosY: position.y,
    }

    setIsDragging(true)

    event.currentTarget
      .setPointerCapture?.(
        event.pointerId
      )
  }

  const handlePointerMove = (
    event
  ) => {
    if (!dragRef.current.active) {
      return
    }

    const dx =
      event.clientX -
      dragRef.current.startX

    const dy =
      event.clientY -
      dragRef.current.startY

    setPosition({
      x:
        dragRef.current.startPosX +
        dx,
      y:
        dragRef.current.startPosY +
        dy,
    })
  }

  const handlePointerUp = (
    event
  ) => {
    dragRef.current.active = false

    setIsDragging(false)

    if (
      dragRef.current.pointerId !== null
    ) {
      event.currentTarget
        .releasePointerCapture?.(
          dragRef.current.pointerId
        )
    }
  }

  /*
    EXPORT
  */

  const waitForImages = async (
    element
  ) => {
    const images = [
      ...element.querySelectorAll('img'),
    ]

    await Promise.all(
      images.map((img) => {
        if (img.complete) {
          return Promise.resolve()
        }

        return new Promise((resolve) => {
          const done = () => {
            img.removeEventListener(
              'load',
              done
            )

            img.removeEventListener(
              'error',
              done
            )

            resolve()
          }

          img.addEventListener(
            'load',
            done
          )

          img.addEventListener(
            'error',
            done
          )
        })
      })
    )
  }

  const createPng = async () => {
    if (!frameRef.current) {
      throw new Error(
        'Frame not found.'
      )
    }

    const frame =
      frameRef.current

    await waitForImages(frame)

    const isBanner =
      mode === 'banner'

    /*
      IMPORTANT:
      Export the real frame dimensions.
      The preview scaling is ignored.
    */

    const width =
      isBanner ? 720 : 540

    const height =
      isBanner ? 405 : 675

    return toPng(frame, {
      cacheBust: true,

      width,
      height,

      pixelRatio: 2,

      backgroundColor:
        theme.cream,

      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: 'none',
        margin: '0',
      },
    })
  }

  const downloadDataUrl = (
    dataUrl,
    filename
  ) => {
    const link =
      document.createElement('a')

    link.download = filename
    link.href = dataUrl

    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const getFilename = () => {
    if (mode === 'profile') {
      return 'builder-studio-profile.png'
    }

    if (mode === 'builder') {
      return 'builder-studio-id.png'
    }

    if (mode === 'banner') {
      return 'builder-studio-banner.png'
    }

    return 'builder-studio-team.png'
  }

  const downloadImage = async () => {
    if (isExporting) return

    setIsExporting(true)

    try {
      const dataUrl =
        await createPng()

      downloadDataUrl(
        dataUrl,
        getFilename()
      )

      showNotice(
        'PNG exported successfully.'
      )
    } catch (error) {
      console.error(
        'PNG export failed:',
        error
      )

      showNotice(
        'Could not create the PNG.'
      )
    } finally {
      setIsExporting(false)
    }
  }

  /*
    X SHARE
  */

  const shareOnX = () => {
    const text =
      mode === 'banner'
        ? `${bannerText} · ${bannerSubtext} #BuilderStudio`
        : `Made my builder graphic with ${APP_NAME}. #BuilderStudio`

    const url =
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    )
  }

  /*
    NATIVE IMAGE SHARE
  */

  const shareImage = async () => {
    if (isExporting) return

    setIsExporting(true)

    try {
      const dataUrl =
        await createPng()

      const response =
        await fetch(dataUrl)

      const blob =
        await response.blob()

      const file =
        new File(
          [blob],
          getFilename(),
          {
            type: 'image/png',
          }
        )

      const canShare =
        typeof navigator.share ===
          'function' &&
        (
          !navigator.canShare ||
          navigator.canShare({
            files: [file],
          })
        )

      if (canShare) {
        await navigator.share({
          title: APP_NAME,
          text:
            'My Builder Studio graphic.',
          files: [file],
        })

        showNotice(
          'Share sheet opened.'
        )
      } else {
        downloadDataUrl(
          dataUrl,
          getFilename()
        )

        showNotice(
          'Image downloaded because sharing is unavailable here.'
        )
      }
    } catch (error) {
      if (
        error?.name === 'AbortError'
      ) {
        return
      }

      console.error(
        'Share failed:',
        error
      )

      showNotice(
        'Sharing is unavailable on this device.'
      )
    } finally {
      setIsExporting(false)
    }
  }

  /*
    FIELD
  */

  const Field = ({
    label,
    value,
    onChange,
    maxLength = 80,
    placeholder,
  }) => (
    <label className="field">
      <span>{label}</span>

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete="off"
      />
    </label>
  )

  /*
    PHOTO
  */

  const Photo = ({
    className = '',
    emptyLabel = 'ADD PHOTO',
  }) => (
    <div
      className={
        `photo-shell ${className} ${
          imageUrl
            ? 'has-image'
            : 'is-empty'
        } ${
          isDragging
            ? 'dragging'
            : ''
        }`
      }
      onPointerDown={
        handlePointerDown
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerUp={
        handlePointerUp
      }
      onPointerCancel={
        handlePointerUp
      }
      role={
        imageUrl
          ? 'button'
          : undefined
      }
      tabIndex={
        imageUrl
          ? 0
          : undefined
      }
      aria-label={
        imageUrl
          ? 'Drag photo to reposition'
          : emptyLabel
      }
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          draggable="false"
          style={{
            transform:
              `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          }}
        />
      ) : (
        <div className="photo-empty">
          <span className="photo-cross">
            +
          </span>

          <span>
            {emptyLabel}
          </span>
        </div>
      )}
    </div>
  )

  /*
    PHOTO TOOLS
  */

  const PhotoTools = () => (
    <div className="photo-tools">
      <span className="tools-label">
        PHOTO
      </span>

      <button
        type="button"
        onClick={zoomOut}
        disabled={!imageUrl}
      >
        −
      </button>

      <span className="zoom-value">
        {Math.round(zoom * 100)}%
      </span>

      <button
        type="button"
        onClick={zoomIn}
        disabled={!imageUrl}
      >
        +
      </button>

      <button
        type="button"
        onClick={resetPhoto}
        disabled={!imageUrl}
      >
        CENTER
      </button>

      {imageUrl && (
        <button
          type="button"
          onClick={clearMainPhoto}
        >
          REMOVE
        </button>
      )}
    </div>
  )

  /*
    THEMES
  */

  const ThemePicker = () => (
    <div className="theme-section">
      <div className="section-kicker">
        VISUAL THEME
      </div>

      <div className="theme-picker">
        {Object.entries(THEMES).map(
          ([key, value]) => (
            <button
              type="button"
              key={key}
              className={
                themeName === key
                  ? 'selected'
                  : ''
              }
              onClick={() =>
                setThemeName(key)
              }
            >
              <span
                className="theme-swatch"
                style={{
                  background:
                    `linear-gradient(135deg, ${value.green} 50%, ${value.pink} 50%)`,
                }}
              />

              {value.name}
            </button>
          )
        )}
      </div>
    </div>
  )

  /*
    ACTIONS
  */

  const Actions = () => (
    <div className="actions">
      <button
        type="button"
        className="primary-action"
        onClick={downloadImage}
        disabled={isExporting}
      >
        {isExporting
          ? 'MAKING PNG…'
          : 'DOWNLOAD PNG'}
      </button>

      <div className="action-row">
        <button
          type="button"
          onClick={shareOnX}
        >
          𝕏 SHARE
        </button>

        <button
          type="button"
          onClick={shareImage}
        >
          SEND IMAGE
        </button>
      </div>
    </div>
  )

  /*
    DECORATIONS
  */

  const Decorations = () => (
    <>
      <div className="deco orbit-a" />
      <div className="deco orbit-b" />

      <div className="deco star-a">
        ✦
      </div>

      <div className="deco star-b">
        ✦
      </div>

      <div className="deco plus-a">
        +
      </div>

      <div className="deco plus-b">
        +
      </div>

      <div className="deco square-a" />
      <div className="deco square-b" />

      <span className="tiny-label tiny-a">
        BUILD_26
      </span>

      <span className="tiny-label tiny-b">
        BUILD / SHARE / REPEAT
      </span>
    </>
  )

  /*
    PROFILE FRAME
  */

  const ProfileFrame = () => (
    <div
      className="frame portrait-frame"
      ref={frameRef}
      style={{
        '--green': theme.green,
        '--dark': theme.dark,
        '--pink': theme.pink,
        '--cream': theme.cream,
        '--ink': theme.ink,
      }}
    >
      <div className="frame-grid" />

      <Decorations />

      <div className="frame-top">
        <span>
          BUILDER STUDIO
        </span>

        <span>
          PROFILE / 01
        </span>
      </div>

      <div className="profile-location">
        {residency}
      </div>

      <div className="profile-brand">
        <strong>BUILD</strong>
        <span>YOUR</span>
        <strong>ID</strong>
      </div>

      <div className="profile-photo-wrap">
        <Photo
          className="profile-photo"
          emptyLabel="ADD PHOTO"
        />

        <span className="photo-index">
          001
        </span>
      </div>

      <div className="profile-copy">
        <div className="profile-kicker">
          BUILDER PROFILE
        </div>

        <h2>
          {name || 'YOUR NAME'}
        </h2>

        <p>
          {role ||
            'YOUR STACK / ROLE'}
        </p>

        <div className="title-pill">
          {title ||
            'YOUR BUILDER TITLE'}
        </div>
      </div>

      <div className="status-row">
        <span>
          <i />
          BUILDING
        </span>

        <span>
          {residency || 'ANYWHERE'}
        </span>

        <span>
          2026
        </span>
      </div>

      <div className="frame-bottom">
        <span>
          {APP_NAME}
        </span>

        <span>
          #BUILDERSTUDIO
        </span>
      </div>
    </div>
  )

  /*
    BUILDER ID FRAME
  */

  const BuilderFrame = () => (
    <div
      className="frame portrait-frame builder-frame"
      ref={frameRef}
      style={{
        '--green': theme.green,
        '--dark': theme.dark,
        '--pink': theme.pink,
        '--cream': theme.cream,
        '--ink': theme.ink,
      }}
    >
      <div className="frame-grid" />

      <Decorations />

      <div className="builder-head">
        <div>
          <span className="pink-label">
            BUILDER ID
          </span>

          <small>
            BUILDER STUDIO · 2026
          </small>
        </div>

        <strong>
          ID / 26
        </strong>
      </div>

      <div className="builder-id">
        #{builderId || '000'}
      </div>

      <div className="builder-photo-wrap">
        <Photo
          className="builder-photo"
          emptyLabel="ADD PHOTO"
        />
      </div>

      <div className="builder-identity">
        <h2>
          {name || 'YOUR NAME'}
        </h2>

        <p>
          {role ||
            'YOUR STACK / ROLE'}
        </p>

        <div className="title-pill">
          {title ||
            'YOUR BUILDER TITLE'}
        </div>
      </div>

      <div className="builder-data">
        <div>
          <small>
            LOCATION
          </small>

          <strong>
            {residency ||
              'ANYWHERE'}
          </strong>
        </div>

        <div>
          <small>
            STATUS
          </small>

          <strong>
            BUILDING
          </strong>
        </div>

        <div>
          <small>
            YEAR
          </small>

          <strong>
            2026
          </strong>
        </div>
      </div>

      <div className="builder-footer">
        <span>
          {APP_NAME}
        </span>

        <span>
          #BUILDERSTUDIO
        </span>
      </div>
    </div>
  )

  /*
    BANNER FRAME
  */

  const BannerFrame = () => (
    <div
      className="frame banner-frame"
      ref={frameRef}
      style={{
        '--green': theme.green,
        '--dark': theme.dark,
        '--pink': theme.pink,
        '--cream': theme.cream,
        '--ink': theme.ink,
      }}
    >
      <div className="frame-grid" />

      <div className="banner-ring ring-one" />
      <div className="banner-ring ring-two" />

      <div className="banner-spark spark-one">
        ✦
      </div>

      <div className="banner-spark spark-two">
        ✦
      </div>

      <div className="banner-cross">
        +
      </div>

      <div className="banner-head">
        <span className="pink-label">
          #BUILDERSTUDIO
        </span>

        <span>
          CREATE · BUILD · SHARE
        </span>
      </div>

      <div className="banner-content">
        <div className="banner-index">
          002 / BANNER
        </div>

        <h2>
          {bannerText ||
            'BUILD SOMETHING WILD'}
        </h2>

        <p>
          {bannerSubtext ||
            'MAKE · BREAK · REBUILD'}
        </p>

        <div className="banner-rule">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="banner-footer">
        <span>
          {APP_NAME}
        </span>

        <strong>
          BUILD / 2026
        </strong>
      </div>
    </div>
  )

  /*
    TEAM FRAME
  */

  const TeamFrame = () => (
    <div
      className="frame team-frame"
      ref={frameRef}
      style={{
        '--green': theme.green,
        '--dark': theme.dark,
        '--pink': theme.pink,
        '--cream': theme.cream,
        '--ink': theme.ink,
      }}
    >
      <div className="frame-grid" />

      <Decorations />

      <div className="team-head">
        <div>
          <span className="pink-label">
            BUILDER COLLECTIVE
          </span>

          <h2>
            THE CREW
          </h2>
        </div>

        <strong>
          BUILD
          <br />
          TOGETHER
        </strong>
      </div>

      <div className="team-grid">
        {teamMembers.map(
          (member, index) => (
            <div
              className="team-card"
              key={`team-${index}`}
            >
              <div className="team-card-top">
                <span>
                  0{index + 1}
                </span>

                <span>
                  BUILDER
                </span>
              </div>

              <div className="team-photo">
                {member.image ? (
                  <img
                    src={member.image}
                    alt=""
                  />
                ) : (
                  <div className="team-photo-empty">
                    <span>+</span>

                    <small>
                      PHOTO
                    </small>
                  </div>
                )}
              </div>

              <h3>
                {member.name ||
                  'YOUR NAME'}
              </h3>

              <p>
                {member.role ||
                  'YOUR ROLE'}
              </p>
            </div>
          )
        )}
      </div>

      <div className="team-footer">
        <span>
          {APP_NAME}
        </span>

        <strong>
          #BUILDERSTUDIO
        </strong>

        <span>
          4 BUILDERS
        </span>
      </div>
    </div>
  )

  /*
    PROFILE CONTROLS
  */

  const ProfileControls = () => (
    <aside className="controls">
      <div className="controls-heading">
        <span>01</span>
        <h2>PROFILE</h2>
      </div>

      <Field
        label="NAME"
        value={name}
        onChange={setName}
        maxLength={40}
      />

      <Field
        label="STACK / ROLE"
        value={role}
        onChange={setRole}
        maxLength={60}
      />

      <div className="field-with-button">
        <Field
          label="BUILDER TITLE"
          value={title}
          onChange={setTitle}
          maxLength={40}
        />

        <button
          type="button"
          className="random-button"
          onClick={randomTitle}
        >
          ↻
        </button>
      </div>

      <Field
        label="LOCATION"
        value={residency}
        onChange={setResidency}
        maxLength={30}
      />

      <PhotoTools />
      <ThemePicker />
      <Actions />
    </aside>
  )

  /*
    BUILDER CONTROLS
  */

  const BuilderControls = () => (
    <aside className="controls">
      <div className="controls-heading">
        <span>02</span>
        <h2>BUILDER ID</h2>
      </div>

      <Field
        label="NAME"
        value={name}
        onChange={setName}
        maxLength={40}
      />

      <Field
        label="STACK / ROLE"
        value={role}
        onChange={setRole}
        maxLength={60}
      />

      <div className="field-with-button">
        <Field
          label="BUILDER TITLE"
          value={title}
          onChange={setTitle}
          maxLength={40}
        />

        <button
          type="button"
          className="random-button"
          onClick={randomTitle}
        >
          ↻
        </button>
      </div>

      <Field
        label="BUILDER NUMBER"
        value={builderId}
        onChange={setBuilderId}
        maxLength={6}
      />

      <Field
        label="LOCATION"
        value={residency}
        onChange={setResidency}
        maxLength={30}
      />

      <PhotoTools />
      <ThemePicker />
      <Actions />
    </aside>
  )

  /*
    BANNER CONTROLS
  */

  const BannerControls = () => (
    <aside className="controls">
      <div className="controls-heading">
        <span>03</span>
        <h2>BANNER</h2>
      </div>

      <Field
        label="MAIN TEXT"
        value={bannerText}
        onChange={setBannerText}
        maxLength={32}
      />

      <Field
        label="SUBTEXT"
        value={bannerSubtext}
        onChange={setBannerSubtext}
        maxLength={50}
      />

      <div className="preset-section">
        <div className="section-kicker">
          QUICK TEXT
        </div>

        <div className="preset-grid">
          {[
            [
              'BUILD LOUD',
              'MAKE · BREAK · REPEAT',
            ],
            [
              'MAKE IT WEIRD',
              'NO BAD IDEAS',
            ],
            [
              'SHIP SOMETHING',
              'NO EXCUSES',
            ],
            [
              'STAY CURIOUS',
              'BUILD / SHARE',
            ],
          ].map(
            ([main, sub]) => (
              <button
                type="button"
                key={main}
                onClick={() => {
                  setBannerText(main)
                  setBannerSubtext(sub)
                }}
              >
                {main}
              </button>
            )
          )}
        </div>
      </div>

      <ThemePicker />
      <Actions />
    </aside>
  )

  /*
    TEAM CONTROLS
  */

  const TeamControls = () => (
    <aside className="controls team-controls">
      <div className="controls-heading">
        <span>04</span>
        <h2>TEAM</h2>
      </div>

      <p className="helper">
        Give every builder their own
        photo, name, and role.
      </p>

      <div className="team-editor">
        {teamMembers.map(
          (member, index) => (
            <div
              className="team-editor-card"
              key={`editor-${index}`}
            >
              <div className="editor-number">
                0{index + 1}
              </div>

              <label className="mini-upload">
                {member.image
                  ? 'CHANGE PHOTO'
                  : 'ADD PHOTO'}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    handleTeamImage(
                      index,
                      event
                    )
                  }
                />
              </label>

              {member.image && (
                <button
                  type="button"
                  className="remove-mini"
                  onClick={() =>
                    removeTeamImage(index)
                  }
                >
                  REMOVE PHOTO
                </button>
              )}

              <Field
                label="NAME"
                value={member.name}
                onChange={(value) =>
                  updateTeamMember(
                    index,
                    'name',
                    value
                  )
                }
                maxLength={28}
              />

              <Field
                label="ROLE"
                value={member.role}
                onChange={(value) =>
                  updateTeamMember(
                    index,
                    'role',
                    value
                  )
                }
                maxLength={28}
              />
            </div>
          )
        )}
      </div>

      <ThemePicker />
      <Actions />
    </aside>
  )

  return (
    <div
      className="app"
      style={{
        '--green': theme.green,
        '--dark': theme.dark,
        '--pink': theme.pink,
        '--cream': theme.cream,
        '--ink': theme.ink,
      }}
    >
      <div className="background-shape shape-one" />
      <div className="background-shape shape-two" />
      <div className="background-shape shape-three" />

      <header className="site-header">
        <div className="header-topline">
          <span>
            {APP_NAME}
          </span>

          <span>
            PERSONAL PROJECT / 2026
          </span>
        </div>

        <div className="hero-title">
          <span>BUILD</span>

          <span className="outline-word">
            YOUR
          </span>

          <span>
            IDENTITY
          </span>
        </div>

        <div className="header-bottomline">
          <p>
            Create graphics that look like
            you actually meant to make them.
          </p>

          <span>
            NO LOGIN · NO UPLOADS · CLIENT-SIDE
          </span>
        </div>
      </header>

      <nav
        className="mode-nav"
        aria-label="Graphic type"
      >
        {MODES.map(
          ([key, label], index) => (
            <button
              type="button"
              key={key}
              className={
                mode === key
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setMode(key)
              }
            >
              <span>
                0{index + 1}
              </span>

              {label}

              {mode === key && (
                <b>●</b>
              )}
            </button>
          )
        )}
      </nav>

      <section className="upload-bar">
        <div className="upload-copy">
          <span className="upload-icon">
            ↑
          </span>

          <div>
            <strong>
              ADD YOUR PHOTO
            </strong>

            <small>
              {imageName ||
                'JPG, PNG or WebP · max 10 MB · max 5000 × 5000px'}
            </small>
          </div>
        </div>

        <div className="upload-actions">
          <label className="upload-button">
            CHOOSE PHOTO

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleImageChange
              }
            />
          </label>

          {imageUrl && (
            <button
              type="button"
              className="clear-button"
              onClick={
                clearMainPhoto
              }
            >
              CLEAR
            </button>
          )}
        </div>
      </section>

      <main
        className={`workspace workspace-${mode}`}
      >
        <div className="preview-panel">
          <div className="preview-meta">
            <span>
              LIVE PREVIEW
            </span>

            <span>
              {mode.toUpperCase()} ·{' '}
              {theme.name}
            </span>
          </div>

          <div
            className="preview-stage"
            ref={stageRef}
          >
            <div className="scaled-frame">
              {mode === 'profile' && (
                <ProfileFrame />
              )}

              {mode === 'builder' && (
                <BuilderFrame />
              )}

              {mode === 'banner' && (
                <BannerFrame />
              )}

              {mode === 'team' && (
                <TeamFrame />
              )}
            </div>
          </div>

          <div className="preview-hint">
            <span>
              DRAG PHOTO TO REPOSITION
            </span>

            <span>
              PNG EXPORT · 1080 × 1350
            </span>
          </div>
        </div>

        {mode === 'profile' && (
          <ProfileControls />
        )}

        {mode === 'builder' && (
          <BuilderControls />
        )}

        {mode === 'banner' && (
          <BannerControls />
        )}

        {mode === 'team' && (
          <TeamControls />
        )}
      </main>

      <footer className="site-footer">
        <div>
          <strong>
            {APP_NAME}
          </strong>

          <span>
            PERSONAL CREATOR TOOL
          </span>
        </div>

        <div>
          <span>
            CREATE · BUILD · SHARE
          </span>

          <span>
            BUILT FOR THE WEB
          </span>
        </div>
      </footer>

      {notice && (
        <div
          className="toast"
          role="status"
        >
          {notice}
        </div>
      )}
    </div>
  )
}

export default App