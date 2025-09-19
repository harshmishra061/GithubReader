import { useEffect, useMemo, useState, useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { 
  vscDarkPlus, 
  vs, 
  oneDark, 
  oneLight, 
  atomDark, 
  dracula, 
  materialDark, 
  materialLight,
  prism,
  tomorrow,
  twilight
} from 'react-syntax-highlighter/dist/esm/styles/prism'
import './App.css'

function parseGithubUrl(input) {
  try {
    const url = new URL(input)
    if (url.hostname !== 'github.com') return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null
    const owner = parts[0]
    const repo = parts[1].replace(/\.git$/, '')
    const path = parts.slice(2).join('/')
    return { owner, repo, path }
  } catch {
    return null
  }
}

function detectLanguage(filename) {
  const name = filename.toLowerCase()
  
  // Special cases for files without extensions or with special names
  if (name === 'dockerfile' || name.endsWith('/dockerfile')) {
    return 'dockerfile'
  }
  if (name === 'makefile' || name.endsWith('/makefile')) {
    return 'makefile'
  }
  if (name === 'cmake' || name.endsWith('/cmake')) {
    return 'cmake'
  }
  if (name === 'gradle' || name.endsWith('/gradle')) {
    return 'gradle'
  }
  if (name === 'rakefile' || name.endsWith('/rakefile')) {
    return 'ruby'
  }
  if (name === 'gemfile' || name.endsWith('/gemfile')) {
    return 'ruby'
  }
  if (name === 'package.json' || name.endsWith('/package.json')) {
    return 'json'
  }
  if (name === 'composer.json' || name.endsWith('/composer.json')) {
    return 'json'
  }
  if (name === 'cargo.toml' || name.endsWith('/cargo.toml')) {
    return 'toml'
  }
  if (name === 'pyproject.toml' || name.endsWith('/pyproject.toml')) {
    return 'toml'
  }
  
  const extension = filename.split('.').pop().toLowerCase()
  const languageMap = {
    // Web technologies
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'vue': 'vue',
    'svelte': 'svelte',
    
    // Programming languages
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'r': 'r',
    'm': 'objectivec',
    'mm': 'objectivec',
    
    // Scripting
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'fish': 'bash',
    'ps1': 'powershell',
    'psm1': 'powershell',
    'bat': 'batch',
    'cmd': 'batch',
    
    // Data formats
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'cfg': 'ini',
    'conf': 'ini',
    
    // Database
    'sql': 'sql',
    'mysql': 'sql',
    'pgsql': 'sql',
    
    // Markup
    'md': 'markdown',
    'markdown': 'markdown',
    'tex': 'latex',
    'rst': 'restructuredtext',
    
    // Config files
    'dockerfile': 'dockerfile',
    'docker': 'dockerfile',
    'makefile': 'makefile',
    'cmake': 'cmake',
    'gradle': 'gradle',
    'maven': 'xml',
    
    // Other
    'lua': 'lua',
    'perl': 'perl',
    'haskell': 'haskell',
    'clojure': 'clojure',
    'elm': 'elm',
    'dart': 'dart',
    'solidity': 'solidity',
    'zig': 'zig',
    'nim': 'nim',
    'crystal': 'crystal',
    'julia': 'julia',
    'ocaml': 'ocaml',
    'fsharp': 'fsharp',
    'vb': 'vbnet',
    'vbnet': 'vbnet',
    'prolog': 'prolog',
    'erlang': 'erlang',
    'elixir': 'elixir',
    'groovy': 'groovy',
    'd': 'd',
    'ada': 'ada',
    'fortran': 'fortran',
    'cobol': 'cobol',
    'pascal': 'pascal',
    'delphi': 'pascal',
    'assembly': 'assembly',
    'asm': 'assembly',
    's': 'assembly',
    'llvm': 'llvm',
    'wat': 'webassembly',
    'wasm': 'webassembly'
  }
  
  return languageMap[extension] || 'text'
}

function getCodeThemeStyle(themeName, currentTheme) {
  const darkThemes = {
    vscDarkPlus,
    oneDark,
    atomDark,
    dracula,
    materialDark,
    tomorrow,
    twilight
  }
  
  const lightThemes = {
    vs,
    oneLight,
    materialLight,
    prism
  }
  
  // If in light mode, only allow light themes
  if (currentTheme === 'light') {
    return lightThemes[themeName] || vs
  }
  
  // If in dark mode, only allow dark themes
  return darkThemes[themeName] || vscDarkPlus
}

function getThemeOptions(currentTheme) {
  if (currentTheme === 'light') {
    return [
      { value: 'vs', label: 'Visual Studio' },
      { value: 'oneLight', label: 'One Light' },
      { value: 'materialLight', label: 'Material Light' },
      { value: 'prism', label: 'Prism' }
    ]
  } else {
    return [
      { value: 'vscDarkPlus', label: 'VS Code Dark+' },
      { value: 'oneDark', label: 'One Dark' },
      { value: 'atomDark', label: 'Atom Dark' },
      { value: 'dracula', label: 'Dracula' },
      { value: 'materialDark', label: 'Material Dark' },
      { value: 'tomorrow', label: 'Tomorrow' },
      { value: 'twilight', label: 'Twilight' }
    ]
  }
}

const PROGRAMMING_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sass', label: 'Sass' },
  { value: 'less', label: 'Less' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'scala', label: 'Scala' },
  { value: 'r', label: 'R' },
  { value: 'objectivec', label: 'Objective-C' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'batch', label: 'Batch' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
  { value: 'ini', label: 'INI' },
  { value: 'sql', label: 'SQL' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'latex', label: 'LaTeX' },
  { value: 'restructuredtext', label: 'reStructuredText' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'makefile', label: 'Makefile' },
  { value: 'cmake', label: 'CMake' },
  { value: 'gradle', label: 'Gradle' },
  { value: 'lua', label: 'Lua' },
  { value: 'perl', label: 'Perl' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'clojure', label: 'Clojure' },
  { value: 'elm', label: 'Elm' },
  { value: 'dart', label: 'Dart' },
  { value: 'solidity', label: 'Solidity' },
  { value: 'zig', label: 'Zig' },
  { value: 'nim', label: 'Nim' },
  { value: 'crystal', label: 'Crystal' },
  { value: 'julia', label: 'Julia' },
  { value: 'ocaml', label: 'OCaml' },
  { value: 'fsharp', label: 'F#' },
  { value: 'vbnet', label: 'VB.NET' },
  { value: 'prolog', label: 'Prolog' },
  { value: 'erlang', label: 'Erlang' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'groovy', label: 'Groovy' },
  { value: 'd', label: 'D' },
  { value: 'ada', label: 'Ada' },
  { value: 'fortran', label: 'Fortran' },
  { value: 'cobol', label: 'COBOL' },
  { value: 'pascal', label: 'Pascal' },
  { value: 'assembly', label: 'Assembly' },
  { value: 'llvm', label: 'LLVM' },
  { value: 'webassembly', label: 'WebAssembly' },
  { value: 'text', label: 'Plain Text' }
]


function App() {
  const [urlInput, setUrlInput] = useState('')
  const [repo, setRepo] = useState(null)
  const [pathStack, setPathStack] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedFilePath, setSelectedFilePath] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [codeTheme, setCodeTheme] = useState(() => {
    const saved = localStorage.getItem('codeTheme')
    const currentTheme = localStorage.getItem('theme') || 'dark'
    if (saved) return saved
    
    // Return appropriate default based on theme
    return currentTheme === 'light' ? 'vs' : 'vscDarkPlus'
  })
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [fileCache, setFileCache] = useState(new Map())

  const currentPath = useMemo(() => pathStack.join('/'), [pathStack])

  // Parse URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const repoUrl = urlParams.get('repo')
    const path = urlParams.get('path')
    const file = urlParams.get('file')
    
    if (repoUrl) {
      setUrlInput(repoUrl)
      const parsed = parseGithubUrl(repoUrl)
      if (parsed) {
        setRepo({ owner: parsed.owner, repo: parsed.repo })
        if (path) {
          setPathStack(path.split('/').filter(Boolean))
        }
        if (file) {
          setSelectedFilePath(file)
        }
      }
    }
  }, [])


  const openFile = useCallback(async (item) => {
    if (item.type !== 'file') return
    
    // Check if file is already cached
    const cacheKey = `${repo.owner}/${repo.repo}/${item.path}`
    if (fileCache.has(cacheKey)) {
      const cachedContent = fileCache.get(cacheKey)
      setSelectedFile({ path: item.path, content: cachedContent })
      setSelectedFilePath(item.path)
      
      // Auto-detect language if not set
      if (!selectedLanguage) {
        const detected = detectLanguage(item.name)
        setSelectedLanguage(detected)
      }
      return
    }
    
    setLoading(true)
    setError('')
    try {
      let text = ''
      
      // Always use download_url if available (more efficient)
      if (item.download_url) {
        const res = await fetch(item.download_url)
        if (res.ok) {
          text = await res.text()
        } else {
          throw new Error(`Failed to fetch file content (${res.status})`)
        }
      } else {
        // Fallback to GitHub API only if download_url is not available
        const api = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${item.path}`
        const res2 = await fetch(api, { headers: { Accept: 'application/vnd.github+json' } })
        if (!res2.ok) throw new Error(`Failed to fetch file (${res2.status})`)
        const json = await res2.json()
        if (json && json.content && json.encoding === 'base64') {
          text = atob(json.content.replace(/\n/g, ''))
        } else {
          throw new Error('Unsupported file content response')
        }
      }
      
      // Cache the file content
      setFileCache(prev => new Map(prev).set(cacheKey, text))
      
      setSelectedFile({ path: item.path, content: text })
      setSelectedFilePath(item.path)
      
      // Auto-detect language if not set
      if (!selectedLanguage) {
        const detected = detectLanguage(item.name)
        setSelectedLanguage(detected)
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch file')
    } finally {
      setLoading(false)
    }
  }, [repo, selectedLanguage, fileCache])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    
    // Only reset code theme if current theme is incompatible with the mode
    const currentCodeTheme = codeTheme
    const isCompatible = theme === 'light' 
      ? ['vs', 'oneLight', 'materialLight', 'prism'].includes(currentCodeTheme)
      : ['vscDarkPlus', 'oneDark', 'atomDark', 'dracula', 'materialDark', 'tomorrow', 'twilight'].includes(currentCodeTheme)
    
    if (!isCompatible) {
      const defaultTheme = theme === 'light' ? 'vs' : 'vscDarkPlus'
      setCodeTheme(defaultTheme)
    }
  }, [theme, codeTheme])

  useEffect(() => {
    localStorage.setItem('codeTheme', codeTheme)
  }, [codeTheme])

  // Update URL when repository or path changes
  useEffect(() => {
    if (repo) {
      const url = new URL(window.location)
      url.searchParams.set('repo', `https://github.com/${repo.owner}/${repo.repo}`)
      if (pathStack.length > 0) {
        url.searchParams.set('path', pathStack.join('/'))
      }
      if (selectedFilePath) {
        url.searchParams.set('file', selectedFilePath)
      }
      window.history.replaceState({}, '', url)
    }
  }, [repo, pathStack, selectedFilePath])

  useEffect(() => {
    if (selectedFile && selectedLanguage === '') {
      // Only auto-detect if user has selected "Auto-detect" option
      setSelectedLanguage(detectLanguage(selectedFile.path))
    }
  }, [selectedFile, selectedLanguage])


  useEffect(() => {
    if (!repo) return
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError('')
      try {
        const api = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${currentPath}`
        const res = await fetch(api, { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } })
        if (!res.ok) throw new Error(`Failed to load contents (${res.status})`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : [data]
        list.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
          return a.name.localeCompare(b.name)
        })
        setItems(list)
        
        // Auto-load selected file if it exists in current directory
        if (selectedFilePath && !selectedFile) {
          const fileToLoad = list.find(item => item.path === selectedFilePath)
          if (fileToLoad && fileToLoad.type === 'file') {
            // Simulate clicking on the file
            setTimeout(() => openFile(fileToLoad), 100)
          }
        }
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [repo, currentPath, selectedFilePath, selectedFile, openFile])


  async function handleOpen() {
    const parsed = parseGithubUrl(urlInput.trim())
    if (!parsed) {
      setError('Enter a valid GitHub repository URL like https://github.com/owner/repo')
      return
    }
    setRepo({ owner: parsed.owner, repo: parsed.repo })
    setPathStack(parsed.path ? parsed.path.split('/') : [])
  }

  function enterDir(name) {
    setPathStack((prev) => [...prev, name])
  }

  function goUpTo(index) {
    setPathStack((prev) => (index < 0 ? [] : prev.slice(0, index + 1)))
  }

  function goToNewRepo() {
    setRepo(null)
    setPathStack([])
    setItems([])
    setSelectedFile(null)
    setSelectedFilePath('')
    setError('')
    setUrlInput('')
    setFileCache(new Map()) // Clear file cache
    
    // Clear URL parameters
    const url = new URL(window.location)
    url.search = ''
    window.history.replaceState({}, '', url)
  }

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  function onUrlKeyDown(e) {
    if (e.key === 'Enter' && !loading && urlInput.trim()) {
      e.preventDefault()
      handleOpen()
    }
  }


  return (
    <div className="app-shell">
      <div className="toolbar">
        {!repo ? (
          <>
            <h1 style={{ marginRight: 12 }}>Github Reader</h1>
            <input
              placeholder="Paste GitHub repo URL (e.g. https://github.com/user/repo or .../tree/main/path)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={onUrlKeyDown}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', minWidth: 280 }}
            />
            <button onClick={handleOpen} disabled={loading || !urlInput.trim()}>Open</button>
            <select 
              value={codeTheme} 
              onChange={(e) => setCodeTheme(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 6, 
                border: '1px solid var(--border)', 
                background: 'var(--panel)', 
                color: 'var(--text)',
                fontSize: '14px'
              }}
              title="Code theme"
            >
              {getThemeOptions(theme).map((themeOption) => (
                <option key={themeOption.value} value={themeOption.value}>
                  {themeOption.label}
                </option>
              ))}
            </select>
            <button onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">{theme === 'dark' ? 'Light' : 'Dark'}</button>
          </>
        ) : (
          <>
            <h1>Github Reader</h1>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <a href={`https://github.com/${repo.owner}/${repo.repo}`} target="_blank" rel="noreferrer">
                {repo.owner}/{repo.repo}
              </a>
              <select 
                value={codeTheme} 
                onChange={(e) => setCodeTheme(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 6, 
                  border: '1px solid var(--border)', 
                  background: 'var(--panel)', 
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
                title="Code theme"
              >
                {getThemeOptions(theme).map((themeOption) => (
                  <option key={themeOption.value} value={themeOption.value}>
                    {themeOption.label}
                  </option>
                ))}
              </select>
              <button onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">{theme === 'dark' ? 'Light' : 'Dark'}</button>
              <button onClick={goToNewRepo} title="Go to new repository">Open New Repository</button>
            </div>
          </>
        )}
      </div>

      {repo && (
        <div className="content">
          <div className="sidebar">
            <div style={{ marginBottom: 8 }}>
              <strong>Path:</strong>{' '}
              <span style={{ cursor: 'pointer', color: 'var(--link)' }} onClick={() => goUpTo(-1)}>root</span>
              {pathStack.map((seg, idx) => (
                <span key={idx}>
                  {' / '}
                  <span style={{ cursor: 'pointer', color: 'var(--link)' }} onClick={() => goUpTo(idx)}>{seg}</span>
                </span>
              ))}
            </div>

            {error && (
              <div style={{ marginTop: 8, color: '#ff6b6b' }}>{error}</div>
            )}

            {loading && <div style={{ marginTop: 8 }}>Loading...</div>}

            {!loading && (
              <ul className="file-list">
                {items.map((item) => (
                  <li 
                    key={item.sha} 
                    className={`file-row ${selectedFile && selectedFile.path === item.path ? 'selected' : ''}`}
                  >
                    {item.type === 'dir' ? (
                      <button 
                        onClick={() => enterDir(item.name)} 
                        className="file-row-button"
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: 'var(--link)', 
                          cursor: 'pointer', 
                          padding: '8px 12px',
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                          {item.name}
                        </button>
                    ) : (
                      <button 
                        onClick={() => openFile(item)} 
                        className="file-row-button"
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: 'var(--link)', 
                          cursor: 'pointer', 
                          padding: '8px 12px',
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                          {item.name}
                        </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="viewer">
            {!selectedFile && (
              <div style={{ opacity: 0.7 }}>Select a file to preview</div>
            )}
            {selectedFile && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.path}</strong>
                  
                  <select 
                    value={selectedLanguage} 
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: 6, 
                      border: '1px solid var(--border)', 
                      background: 'var(--panel)', 
                      color: 'var(--text)',
                      fontSize: '14px',
                      minWidth: '150px'
                    }}
                    title="Select programming language"
                  >
                    <option value="">Auto-detect</option>
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  background: 'var(--panel)'
                }}>
                  <SyntaxHighlighter
                    language={selectedLanguage || detectLanguage(selectedFile.path)}
                    style={getCodeThemeStyle(codeTheme, theme)}
                    customStyle={{
                      margin: 0,
                      background: 'transparent',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                    wrapLongLines={true}
                  >
                    {selectedFile.content}
                  </SyntaxHighlighter>
                </div>
              </>
            )}
          </div>

        </div>
      )}

      {!repo && (
        <div style={{ padding: 16 }}>
          <div style={{ marginTop: 16, opacity: 0.8 }}>
            Paste a GitHub URL to begin.
          </div>
        </div>
      )}
    </div>
  )
}

export default App
