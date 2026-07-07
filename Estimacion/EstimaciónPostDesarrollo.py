import matplotlib.pyplot as plt
import numpy as np

# =====================================================
# ESTIMACIÓN POST DESARROLLO
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

# Horas hombre estimadas
optimista = [8, 4, 4, 1, 1, 4, 3, 3]

probable = [12, 6, 8, 2, 2, 8, 5, 5]

pesimista = [16, 10, 12, 3, 3, 14, 8, 8]

x = np.arange(len(actividades))
width = 0.25

fig, ax = plt.subplots(figsize=(12,6))

b1 = ax.bar(x-width, optimista, width,
            label="Optimista",
            color="lightgreen")

b2 = ax.bar(x, probable, width,
            label="Más probable",
            color="pink")

b3 = ax.bar(x+width, pesimista, width,
            label="Pesimista",
            color="lightcoral")

ax.set_title(
    "Estimación de esfuerzo restante del proyecto",
    fontsize=14,
    fontweight='bold',
    color='#e60073'
)

ax.set_ylabel("Horas hombre")
ax.set_xticks(x)
ax.set_xticklabels(actividades)

ax.grid(axis="y", linestyle="--", alpha=0.5)

for bars in [b1, b2, b3]:
    ax.bar_label(bars, fontsize=8)

ax.legend()

plt.tight_layout()
plt.show()


# =====================================================
# DISTRIBUCIÓN DEL ESFUERZO
# =====================================================

fig, ax = plt.subplots(figsize=(9,7))

colores = [
    "#7fc97f",
    "#80b1d3",
    "#fdc086",
    "#beaed4",
    "#ffff99",
    "#f0027f",
    "#bf5b17"
]

ax.pie(
    probable,
    labels=actividades,
    autopct="%1.1f%%",
    startangle=90,
    colors=colores
)

ax.set_title(
    "Distribución del esfuerzo restante",
    fontsize=14,
    fontweight="bold",
    color="#e60073"
)

plt.tight_layout()
plt.show()

# =====================================================
# COMPARACIÓN TOTAL
# =====================================================

totales = [
    sum(optimista),
    sum(probable),
    sum(pesimista)
]

escenarios = [
    "Optimista",
    "Más probable",
    "Pesimista"
]

fig, ax = plt.subplots(figsize=(7,6))

bars = ax.bar(
    escenarios,
    totales,
    color=[
        "lightgreen",
        "pink",
        "lightcoral"
    ]
)

ax.set_ylabel("Horas hombre")

ax.set_title(
    "Comparación del esfuerzo total restante",
    fontsize=14,
    fontweight="bold",
    color="#e60073"
)

for b in bars:
    ax.text(
        b.get_x()+b.get_width()/2,
        b.get_height()+2,
        f"{b.get_height():.0f} h",
        ha="center",
        fontsize=10
    )

ax.grid(axis="y", linestyle="--", alpha=0.5)

plt.tight_layout()
plt.show()

# =====================================================
# RESUMEN
# =====================================================

print("="*55)
print("      ESTIMACIÓN POST DESARROLLO")
print("="*55)

print(f"Optimista   : {sum(optimista)} horas hombre")
print(f"Más probable: {sum(probable)} horas hombre")
print(f"Pesimista   : {sum(pesimista)} horas hombre")

print("="*55)