import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta

# =====================================================
# ESTIMACIÓN V8 - POST DESARROLLO
# =====================================================

estimaciones = np.arange(1, 9)

optimista = [2.0, 1.9, 3.6, 3.2, 2.9, 1.7, 0.7, 0.20]
probable  = [2.3, 2.9, 6.8, 5.1, 4.6, 2.2, 1.2, 0.35]
pesimista = [2.6, 4.1, 7.3, 6.9, 6.2, 3.5, 1.6, 0.50]

# =====================================================
# GRÁFICO DEL CONO DE INCERTIDUMBRE
# =====================================================

fig, ax = plt.subplots(figsize=(11,6))

ax.fill_between(
    estimaciones,
    pesimista,
    optimista,
    color="#cce5ff",
    alpha=0.4,
    label="Rango de incertidumbre (Cono)"
)

ax.plot(estimaciones, optimista,
        "g--o",
        label="Optimista")

ax.plot(
    estimaciones,
    probable,
    color="#e60073",
    marker="o",
    linewidth=2,
    label="Más probable"
)

ax.plot(
    estimaciones,
    pesimista,
    "r--o",
    label="Pesimista"
)


for i,val in enumerate(probable):
    ax.text(
        i+1,
        val+0.20,
        f"{val:.2f} m",
        ha="center",
        fontsize=8
    )

ax.scatter(
    8,
    probable[-1],
    s=120,
    color="#e60073",
    edgecolors="black",
    zorder=5
)

ax.text(
    8,
    probable[-1]-0.35,
    "Post\nDesarrollo",
    ha="center",
    fontsize=8
)

ax.set_title(
    "Gráfico de estimaciones",
    fontsize=13,
    fontweight="bold",
    color="#e60073"
)

ax.set_xlabel("Número de estimación")
ax.set_ylabel("Duración estimada (meses)")
ax.set_xticks(estimaciones)

ax.grid(True, linestyle="--", alpha=0.5)

ax.legend(loc="upper right")

plt.tight_layout()
plt.show()

# =====================================================
# LÍNEA DE TIEMPO
# =====================================================

dias_por_mes = 30

fechas_estimacion = [
    datetime(2025,9,18),
    datetime(2025,9,25),
    datetime(2025,9,28),
    datetime(2025,10,11),
    datetime(2025,11,4),
    datetime(2025,11,7),
    datetime(2025,11,20),
    datetime(2026, 7, 6) 
]

def add_meses(base, meses):
    return [
        b + timedelta(days=m*dias_por_mes)
        if m else None
        for b,m in zip(base, meses)
    ]

fechas_opt = add_meses(fechas_estimacion, optimista)
fechas_cen = add_meses(fechas_estimacion, probable)
fechas_pes = add_meses(fechas_estimacion, pesimista)

series = [
    (fechas_opt,"Optimista","green"),
    (fechas_cen,"Más probable","#e60073"),
    (fechas_pes,"Pesimista","red"),

]

y_positions=[3,2,1]

fig,ax=plt.subplots(figsize=(11,6))

for (serie,label,color),y in zip(series,y_positions):

    fechas_validas=[d for d in serie if d is not None]
    est_validas=[i for i,d in enumerate(serie,start=1) if d is not None]

    ax.plot(
        est_validas,
        [y]*len(est_validas),
        "o-",
        color=color,
        label=label
    )

    for i,f in zip(est_validas,fechas_validas):
        ax.text(
            i,
            y+0.15,
            f.strftime("%d/%m/%Y"),
            fontsize=8,
            ha="center",
            color="#0073e6"
        )

ax.set_yticks(y_positions)
ax.set_yticklabels([
    "Optimista",
    "Más probable",
    "Pesimista",
])

ax.set_xticks(estimaciones)

ax.set_xlim(0.5,8.5)

ax.set_title(
    "Línea de tiempo de fechas de finalización",
    fontsize=13,
    fontweight="bold",
    color="#e60073"
)

ax.set_xlabel("Número de estimación")

for i,fecha in enumerate(fechas_estimacion):
    texto = f"E{i+1} = {fecha.strftime('%d/%m/%Y')}"

    if i == 7:
        texto += "\n(Post desarrollo)"
    ax.text(
        i+1,
        -0.35,
        f"E{i+1} = {fecha.strftime('%d/%m/%Y')}",
        ha="center",
        fontsize=8,
        fontstyle="italic"
    )

ax.set_ylim(-0.6,3.7)

ax.grid(True,axis="x",linestyle="--",alpha=0.5)

ax.legend(
    loc="upper center",
    bbox_to_anchor=(0.5,-0.20),
    ncol=4
)

plt.tight_layout()
plt.show()

# =====================================================
# ESTIMACIÓN POR ACTIVIDAD
# =====================================================

actividades = [
    "Carga de datos\nreales",
    "Verificación\nde datos",
    "Corrección de\nincidencias",
    "Análisis de\nobservaciones",
    "Planificación\nde ajustes",
    "Implementación\nde correcciones",
    "Actualización\nde la memoria",
    "Preparación\nde la defensa",
]

# Horas hombre por actividad
hh_opt = [8, 4, 4, 1, 1, 4, 3, 3]
hh_cen = [12, 6, 8, 2, 2, 8, 5, 5]
hh_pes = [16, 10, 12, 3, 3, 14, 8, 8]

x = np.arange(len(actividades))
width = 0.25

fig, ax = plt.subplots(figsize=(13,6))

b1 = ax.bar(
    x - width,
    hh_opt,
    width,
    label="Optimista",
    color="lightgreen"
)

b2 = ax.bar(
    x,
    hh_cen,
    width,
    label="Más probable",
    color="pink"
)

b3 = ax.bar(
    x + width,
    hh_pes,
    width,
    label="Pesimista",
    color="lightcoral"
)

ax.set_title(
    "Estimación del esfuerzo por actividad",
    fontsize=13,
    fontweight="bold",
    color="#e60073"
)

ax.set_ylabel("Horas hombre")

ax.set_xticks(x)
ax.set_xticklabels(actividades)

ax.grid(axis="y", linestyle="--", alpha=0.5)

for barras in [b1, b2, b3]:
    ax.bar_label(
        barras,
        fontsize=8,
        padding=2
    )

ax.legend(
    loc="upper center",
    bbox_to_anchor=(0.5, -0.12),
    ncol=3
)

plt.tight_layout()
plt.show()

# =====================================================
# HORAS HOMBRE
# =====================================================

hh_opt = [
600,
570,
637.4,
611,
640,
366.6,
162.9,
28
]

hh_cen = [
690,
870,
1199.7,
1187.9,
1005.2,
483.3,
255.9,
48
]

hh_pes = [
780,
1229,
1616.5,
1371.3,
1355,
776.6,
345.1,
74
]


labels=[f"E{i}" for i in range(1,9)]

x=np.arange(len(labels))

width=0.2

fig,ax=plt.subplots(figsize=(11,6))

b1=ax.bar(
    x-1.5*width,
    hh_opt,
    width,
    label="Optimista",
    color="lightgreen"
)

b2=ax.bar(
    x-0.5*width,
    hh_cen,
    width,
    label="Más probable",
    color="pink"
)

b3=ax.bar(
    x+0.5*width,
    hh_pes,
    width,
    label="Pesimista",
    color="lightcoral"
)



ax.set_xticks(x)
ax.set_xticklabels(labels)

ax.set_ylabel("Horas-hombre")

ax.set_title(
    "Comparación de esfuerzo (h-h) por estimación",
    fontsize=13,
    fontweight="bold",
    color="#e60073"
)

for bars in ax.containers:
    ax.bar_label(
        bars,
        fmt="%.0f",
        fontsize=8
    )

ax.text(
    7,
    hh_cen[-1]+60,
    "Post\nDesarrollo",
    ha="center",
    fontsize=8,
    fontweight="bold"
)

ax.legend(
    loc="upper center",
    bbox_to_anchor=(0.5,-0.15),
    ncol=4
)

ax.grid(
    axis="y",
    linestyle="--",
    alpha=0.5
)

plt.tight_layout()
plt.show()