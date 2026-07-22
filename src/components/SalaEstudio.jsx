import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CamaraConcentracion, { INTERVALO_MS } from "./CamaraConcentracion";
import NexusBurbuja from "./NexusBurbuja";
import AudioConcentracion from "./AudioConcentracion";
import NotasRapidas from "./NotasRapidas";
import { detectarPatronesNuevos } from "../lib/nexusModel";
import { useTheme } from "../ThemeContext";

const SEGUNDOS_POR_MUESTRA = INTERVALO_MS / 1000;
const MUESTRAS_MAXIMAS_PATRON = 15;

const fontStackApple = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';
const fontElegante = "'Cormorant Garamond', serif"; 

// ─────────────────────────────────────────────────────────────
// SINGLETON DE AUDIO
// ─────────────────────────────────────────────────────────────
let audioCtx = null;
const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const reproducirTono = (tipo) => {
  try {
    const ctx = getAudioContext();
    
    const crearSonidoSuave = (freq, tipoOnda, duracion, tiempoInicio, volInicial = 0.1) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = tipoOnda;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + tiempoInicio);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + tiempoInicio); 
      gain.gain.linearRampToValueAtTime(volInicial, ctx.currentTime + tiempoInicio + 0.05); 
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + tiempoInicio + duracion); 
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + tiempoInicio);
      osc.stop(ctx.currentTime + tiempoInicio + duracion + 0.1);
    };

    const crearPulsoSutil = (freq, tiempoInicio) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle"; 
      osc.frequency.setValueAtTime(freq, ctx.currentTime + tiempoInicio);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + tiempoInicio);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + tiempoInicio + 0.05); 
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + tiempoInicio + 0.5); 
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + tiempoInicio);
      osc.stop(ctx.currentTime + tiempoInicio + 0.6);
    };

    if (tipo === "concentrado") {
      crearSonidoSuave(440, "sine", 0.1, 0, 0.15); 
      crearSonidoSuave(554.37, "sine", 0.3, 0.1, 0.15); 
    } else if (tipo === "distraido" || tipo === "ausente") {
      crearPulsoSutil(180, 0);    
      crearPulsoSutil(160, 0.4);  
    } else if (tipo === "pomodoro") {
      crearSonidoSuave(523.25, "sine", 0.4, 0); 
      crearSonidoSuave(659.25, "sine", 0.4, 0.1); 
      crearSonidoSuave(783.99, "sine", 0.6, 0.2); 
    } else if (tipo === "descanso") {
      crearSonidoSuave(400, "sine", 0.5, 0, 0.08);
    }
  } catch (e) {
    console.warn("AudioContext no disponible para notificaciones", e);
  }
};

const ConsejosArquetipo = () => {
  const { t } = useTheme();
  const [arquetipoId, setArquetipoId] = useState("arquitecto");

  const infoArquetipos = {
    desarrollo: {
      titulo: "Perfil en Desarrollo", emoji: "🌱", color: "#BF5AF2",
      descripcion: "Tu aprendizaje depende mucho de la presión externa y aún estás construyendo hábitos de autorregulación.",
      tecnicas: ["Busca un compañero de estudio para anclarte.", "Usa una agenda con bloques de tiempo fijos.", "Empieza con Pomodoros cortos de 25 min.", "Haz un diario de reflexión de 3 min al cerrar."]
    },
    arquitecto: {
      titulo: "Arquitecto Cognitivo", emoji: "🏛️", color: "#BF5AF2",
      descripcion: "Piensas en sistemas. Necesitas ver la estructura completa antes de llenarla de contenido.",
      tecnicas: ["Lee primero el índice y estructura del tema.", "Construye mapas conectando conceptos.", "Aplica el Método Cornell en tus apuntes.", "Define un objetivo muy concreto al iniciar."]
    },
    corredor: {
      titulo: "Corredor de Fondo", emoji: "⚡", color: "#BF5AF2",
      descripcion: "Rindes mejor bajo presión y aprendiendo haciendo. Eres eficiente en sprints.",
      tecnicas: ["Usa una Técnica Pomodoro estricta.", "Crea deadlines (fechas límite) artificiales.", "Intenta resolver ejercicios antes de la teoría.", "Usa flashcards (Anki) para memoria activa."]
    },
    ingeniero: {
      titulo: "Ingeniero del Conocimiento", emoji: "⚙️", color: "#BF5AF2",
      descripcion: "Aprendes construyendo. Los ejemplos y la práctica son tu lenguaje nativo.",
      tecnicas: ["Empieza siempre con un problema real.", "Apóyate en simulaciones interactivas.", "Pregúntate: '¿En qué escenario usaría esto?'.", "Crea tu propio glosario de términos."]
    },
    estratega: {
      titulo: "Pensador Estratégico", emoji: "🔭", color: "#BF5AF2",
      descripcion: "Estudias mejor cuando ves el propósito claro. Te motiva pensar en el largo plazo.",
      tecnicas: ["Escribe explícitamente para qué sirve el tema.", "Conecta la materia con un proyecto de vida.", "Lee casos de aplicación real primero.", "Crea hitos intermedios para celebrar."]
    },
    adaptativo: {
      titulo: "Aprendiz Adaptativo", emoji: "🧠", color: "#BF5AF2",
      descripcion: "Tu metacognición es tu superpoder. Eres capaz de ajustar tu propio método sobre la marcha.",
      tecnicas: ["Aplica el modelo de autorregulación de Zimmerman.", "Crea un diario de aprendizaje iterativo.", "Experimenta con la repetición espaciada.", "Aplica Técnica Feynman: enseña lo que aprendes."]
    },
    equilibrado: {
      titulo: "Perfil Equilibrado", emoji: "⚖️", color: "#BF5AF2",
      descripcion: "Tienes un perfil balanceado. Eres flexible cognitivamente, lo cual es una gran ventaja.",
      tecnicas: ["Experimenta cruzando dos métodos distintos.", "Haz Pomodoros largos con revisión al final.", "Alterna entre lectura teórica y práctica pura.", "Lleva un registro estricto de tu rendimiento."]
    }
  };

  const actual = infoArquetipos[arquetipoId];

  return (
    <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 24, padding: "24px", boxShadow: t.shadow, marginTop: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: t.textLight, letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
          Arquetipos 
        </p>
        <select 
          value={arquetipoId} 
          onChange={(e) => setArquetipoId(e.target.value)}
          style={{ background: t.bgMuted, border: "none", borderRadius: "8px", padding: "6px 10px", fontSize: "12px", color: t.text, fontFamily: fontStackApple, cursor: "pointer", fontWeight: 600 }}
        >
          <option value="desarrollo">En Desarrollo 🌱</option>
          <option value="arquitecto">Arquitecto 🏛️</option>
          <option value="corredor">Corredor ⚡</option>
          <option value="ingeniero">Ingeniero ⚙️</option>
          <option value="estratega">Estratega 🔭</option>
          <option value="adaptativo">Adaptativo 🧠</option>
          <option value="equilibrado">Equilibrado ⚖️</option>
        </select>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "8px" }}>
        <span style={{ fontSize: "20px" }}>{actual.emoji}</span>
        <p style={{ fontSize: "16px", fontWeight: 700, color: actual.color, margin: 0 }}>{actual.titulo}</p>
      </div>
      <p style={{ fontSize: "13px", color: t.textMuted, lineHeight: 1.5, margin: "0 0 16px 0" }}>{actual.descripcion}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {actual.tecnicas.map((tecnica, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: t.bgMuted, padding: "8px 12px", borderRadius: "8px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: actual.color, marginTop: 6 }} />
            <span style={{ fontSize: "12px", color: t.text, lineHeight: 1.4, fontWeight: 500 }}>{tecnica}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SalaEstudio({ config, onFinalizar }) {
  const navigate = useNavigate();
  const { t } = useTheme();
  const sesionId = useRef(`sesion_${Date.now()}`);
  
  // ─────────────────────────────────────────────────────────────
  // LA CLAVE MATEMÁTICA: Usamos Date.now() real
  // ─────────────────────────────────────────────────────────────
  const inicioSesion = useRef(Date.now()); 
  
  const historialPomodoros = useRef([]);
  const contadoresBloque = useRef({ concentrado: 0, distraido: 0, ausente: 0 }); // acumulado de TODA la sesión
  const contadoresBloqueBase = useRef({ concentrado: 0, distraido: 0, ausente: 0 }); // snapshot al iniciar el pomodoro actual
  const ultimoEstadoNotificado = useRef("cargando");
  const vectoresSesion = useRef([]); // buffer de vectores crudos para aprendizaje adaptativo post-sesión

  const [pomodoroActual, setPomodoroActual] = useState(1);
  const [fase, setFase] = useState("trabajo");
  const [tiempoRestante, setTiempoRestante] = useState(25 * 60);
  const [pausado, setPausado] = useState(false);
  const [estadoCamara, setEstadoCamara] = useState("cargando");

  const formatTiempo = (seg) => {
    const m = Math.floor(seg / 60).toString().padStart(2, "0");
    const s = (seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Cuenta SOLO lo acumulado desde que empezó el pomodoro actual (no toda la sesión)
  const deltaBloqueActual = () => {
    const c = contadoresBloque.current;
    const base = contadoresBloqueBase.current;
    return {
      concentrado: c.concentrado - base.concentrado,
      distraido: c.distraido - base.distraido,
      ausente: c.ausente - base.ausente,
    };
  };

  const finalizarYEnviar = useCallback(() => {
    const finSesion = Date.now();
    const hist = [...historialPomodoros.current];

    if (fase === "trabajo") {
      const d = deltaBloqueActual();
      const total = d.concentrado + d.distraido + d.ausente;
      const ipv = total > 0 ? Math.round((d.concentrado / total) * 100) : 0;
      hist.push({ ipv, numero: pomodoroActual });
    }

    const duracionRealSegundos = Math.floor((finSesion - inicioSesion.current) / 1000);
    const cTotal = contadoresBloque.current;
    const tiempoTotalMedido = cTotal.concentrado + cTotal.distraido + cTotal.ausente;

    const ipvGlobalCalculado = tiempoTotalMedido > 0
      ? Math.round((cTotal.concentrado / tiempoTotalMedido) * 100)
      : (hist.length > 0 ? Math.round(hist.reduce((s, p) => s + p.ipv, 0) / hist.length) : 0);

    // ─────────────────────────────────────────────────────────────
    // APRENDIZAJE ADAPTATIVO: buscamos posturas nuevas no cubiertas
    // por la calibración (ej. mirar un segundo monitor) para que el
    // usuario pueda confirmarlas y enriquecer el modelo.
    // ─────────────────────────────────────────────────────────────
    let patronesNuevos = [];
    try {
      const clusters = detectarPatronesNuevos(vectoresSesion.current);
      patronesNuevos = clusters
        .sort((a, b) => b.tamano - a.tamano)
        .slice(0, 2)
        .map((c) => ({
          etiquetaSugerida: c.etiquetaSugerida,
          tamano: c.tamano,
          vectoresMuestra: c.indicesCluster
            .slice(0, MUESTRAS_MAXIMAS_PATRON)
            .map((i) => vectoresSesion.current[i]),
        }));
    } catch (e) {
      console.error("Error detectando patrones nuevos:", e);
    }

    onFinalizar?.({
      sesionId: sesionId.current,
      materia: config?.materia || "General",
      objetivo: config?.objetivo || "Meta",

      // ─────────────────────────────────────────────────────────────
      // AHORA SÍ ENVIAMOS LOS DATOS COMPLETOS
      // ─────────────────────────────────────────────────────────────
      horaInicio: new Date(inicioSesion.current).toISOString(),
      horaFin: new Date(finSesion).toISOString(),
      // Si la sesión es muy corta, al menos dirá 1 minuto para no verse roto.
      duracionMin: Math.floor(duracionRealSegundos / 60) || 1,

      // Convertimos de "número de muestras" a segundos reales de reloj
      tiempoConcentrado: cTotal.concentrado * SEGUNDOS_POR_MUESTRA,
      tiempoDistraido: cTotal.distraido * SEGUNDOS_POR_MUESTRA,
      tiempoAusente: cTotal.ausente * SEGUNDOS_POR_MUESTRA,

      ipvGlobal: ipvGlobalCalculado,
      historialPomodoros: hist,
      patronesNuevos,
    });

    if (!onFinalizar) {
      navigate("/");
    }
  }, [config, onFinalizar, fase, pomodoroActual, navigate]);

  const handleEstadoChange = useCallback((nuevo) => {
    setEstadoCamara(nuevo);
    
    if (fase === "trabajo" && !pausado && nuevo !== "cargando") {
      contadoresBloque.current[nuevo]++;
      
      if (nuevo === "concentrado") {
        if (ultimoEstadoNotificado.current !== "concentrado") {
          reproducirTono("concentrado");
          ultimoEstadoNotificado.current = "concentrado";
        }
      } else if (nuevo === "distraido" || nuevo === "ausente") {
        reproducirTono(nuevo);
        ultimoEstadoNotificado.current = nuevo;
      }
    }
  }, [fase, pausado]);

  useEffect(() => {
    if (pausado) return;
    const timer = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          if (fase === "trabajo") {
            const d = deltaBloqueActual();
            const total = d.concentrado + d.distraido + d.ausente;
            const ipv = total > 0 ? Math.round((d.concentrado / total) * 100) : 0;
            historialPomodoros.current.push({ ipv, numero: pomodoroActual });
            contadoresBloqueBase.current = { ...contadoresBloque.current }; // reinicia el conteo para el próximo bloque

            reproducirTono("pomodoro");
            
            const limitePomodoros = config?.pomodoros || 4;
            
            if (pomodoroActual >= limitePomodoros) { 
              finalizarYEnviar(); 
              return 0; 
            }
            setFase("descanso"); 
            return 5 * 60;
          } else {
            setPomodoroActual(p => p + 1); 
            setFase("trabajo"); 
            reproducirTono("descanso"); 
            
            ultimoEstadoNotificado.current = "cargando";
            
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pausado, fase, pomodoroActual, config, finalizarYEnviar]);

  const progreso = (tiempoRestante / (fase === "trabajo" ? 25 * 60 : 5 * 60)) * 100;
  const totalBloques = config?.pomodoros || 4;

  return (
    <div translate="no" className="notranslate" style={{ minHeight: "100vh", background: t.bg, padding: "32px 20px", fontFamily: fontStackApple }}>
      
      {/* HEADER */}
      <div style={{ maxWidth: 1200, margin: "0 auto 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/assets/blue_logo.png" alt="Nexus" style={{ width: 42, height: 42, objectFit: "contain", filter: "hue-rotate(80deg) saturate(1.6) brightness(0.95) contrast(1.05)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" }}>Nexus</span>
            <div style={{ width: "1px", height: "20px", background: t.borderMid, margin: "0 4px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ 
                width: 8, height: 8, borderRadius: "50%", 
                background: estadoCamara === "concentrado" ? t.green : estadoCamara === "distraido" ? t.amber : estadoCamara === "ausente" ? t.red : t.borderMid,
                transition: "all 0.5s ease"
              }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: t.textLight, textTransform: "lowercase" }}>
                {estadoCamara === "concentrado" && "en foco"}
                {estadoCamara === "distraido" && "dispersa"}
                {estadoCamara === "ausente" && "ausente"}
                {estadoCamara === "cargando" && "iniciando"}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/historial")} style={{ background: "transparent", border: "none", color: t.textLight, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Historial</button>
          <button onClick={() => navigate("/")} style={{ background: t.accent, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>← Inicio</button>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "24fr 46fr 30fr", gap: 32, alignItems: "start" }}>
        
        {/* COL 1: IA + ESTADOS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CamaraConcentracion
            activa={!pausado}
            onEstadoChange={handleEstadoChange}
            onMuestra={(vec) => vectoresSesion.current.push(vec)}
          />
          
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: t.glassPanel,
            backdropFilter: "blur(10px)", borderRadius: "20px", border: `1px solid ${t.border}`, width: "fit-content", marginTop: "12px", boxShadow: t.shadow
          }}>
            <div style={{ width: 26, height: 26, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                position: "absolute", inset: -4, borderRadius: "50%", zIndex: -1, transition: "all 0.6s ease",
                background: estadoCamara === "concentrado" ? t.green : estadoCamara === "distraido" ? t.amber : estadoCamara === "ausente" ? t.red : t.borderMid,
                opacity: 0.4, filter: "blur(8px)"
              }} />
              <img src="/assets/blue_logo.png" alt="status" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "hue-rotate(80deg) saturate(1.6) brightness(0.95) contrast(1.05)" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>
              {estadoCamara === "concentrado" && "En foco"}
              {estadoCamara === "distraido" && "Dispersa"}
              {estadoCamara === "ausente" && "Ausente"}
              {estadoCamara === "cargando" && "Iniciando..."}
            </span>
          </div>
          
          <AudioConcentracion />
        </div>

        {/* COL 2: POMODORO Y GEOMETRÍA MINIMALISTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 35 }}>
          <div style={{ background: t.bgCard, border: `2px solid ${t.border}`, borderRadius: 35, padding: "50px 1px", textAlign: "center", boxShadow: t.shadowMd, width: "100%" }}>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginBottom: "30px" }}>
              {Array.from({ length: totalBloques }).map((_, i) => {
                const num = i + 1;
                const isCompleted = num < pomodoroActual;
                const isCurrent = num === pomodoroActual;
                
                let bgColor = "transparent";
                let borderColor = t.borderMid;
                let shadow = "none";
                let scale = 1;

                if (isCompleted) {
                  bgColor = t.accent;
                  borderColor = t.accent;
                  shadow = "0 2px 6px rgba(0,0,0,0.1)";
                } else if (isCurrent) {
                  borderColor = fase === "trabajo" ? t.accent : t.green;
                  shadow = `0 4px 12px ${fase === "trabajo" ? "rgba(191, 90, 242, 0.3)" : "rgba(48, 209, 88, 0.3)"}`;
                  scale = 1.1;
                }

                return (
                  <div key={i} style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    border: `2px solid ${borderColor}`, background: bgColor,
                    boxShadow: shadow, transform: `scale(${scale})`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} />
                );
              })}
            </div>

            <div style={{ position: "relative", width: 300, height: 300, margin: "0 auto 40px" }}>
              <svg width="300" height="300" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="150" cy="150" r="130" fill="none" stroke={t.bgMuted} strokeWidth="20" opacity="0.3" />
                <circle cx="150" cy="150" r="130" fill="none" stroke={t.accent} strokeWidth="20"
                  strokeDasharray={2 * Math.PI * 130} 
                  strokeDashoffset={((100 - progreso) / 100) * (2 * Math.PI * 130)} 
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <div style={{ fontSize: 70, color: t.text, fontWeight: 400, letterSpacing: "1px", fontFamily: fontStackApple, fontVariantNumeric: "tabular-nums" }}>
                  {formatTiempo(tiempoRestante)}
                </div>
                <div style={{ color: t.textLight, fontSize: 12, fontWeight: 400, letterSpacing: 2 }}>{fase.toUpperCase()}</div>
              </div>
            </div>
            <button onClick={() => setPausado(!pausado)} style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(191, 90, 242, 0.55)", color: t.text, border: "none", fontSize: 28, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>{pausado ? "▶" : "⏸"}</button>
          </div>
          <button onClick={() => { if(window.confirm("¿Finalizar sesión?")) finalizarYEnviar(); }} style={{ background: t.bgCard, border: `2px solid ${t.border}`, borderRadius: "24px", color: t.accent , fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "20px", boxShadow: t.shadow}}>Finalizar Sesión</button>
        </div>

        {/* COL 3: OBJETIVO Y ARQUETIPOS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 24, padding: "24px", boxShadow: t.shadow }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: t.textLight, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 16px 0" }}>OBJETIVO</p>
            <p style={{ fontSize: "24px", fontFamily: fontElegante, fontStyle: "italic", fontWeight: 700, color: t.text, lineHeight: 1.3, margin: 0 }}>
              {config?.objetivo || "Sesión de Enfoque"}
            </p>
          </div>
          
          <NotasRapidas sesionId={sesionId.current} />
          <ConsejosArquetipo />
        </div>

      </div>
      <NexusBurbuja estado={estadoCamara} />
    </div>
  );
}