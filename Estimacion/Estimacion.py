import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta

# --- Datos base ---
fechas_estimacion = [
    datetime(2025, 9, 18),
    datetime(2025, 9, 25),
    datetime(2025, 9, 28),
    datetime(2025, 10, 11),
    datetime(2025, 11, 4),
    datetime(2025, 11, 7)
]
caso_probable = [2.3, 2.9, 6.8, 5.1, 4.6, 2.2]
optimista_meses = [2.0, 1.9, 3.6, 3.2, 2.9, 1.7]
pesimista_meses = [2.6, 4.1, 7.3, 6.9, 6.2, 3.5]
real_meses = [None, None, None, None, None, 1.8]

dias_por_mes = 30
estimaciones = np.arange(1, len(fechas_estimacion) + 1)
labels = [f"E{i}" for i in estimaciones]

# --- Fechas calculadas ---
def add_meses(base, meses):
    return [b + timedelta(days=m * dias_por_mes) if m else None for b, m in zip(base, meses)]

fechas_opt = add_meses(fechas_estimacion, optimista_meses)
fechas_cen = add_meses(fechas_estimacion, caso_probable)
fechas_pes = add_meses(fechas_estimacion, pesimista_meses)
fechas_real = add_meses(fechas_estimacion, real_meses)

# --- Esfuerzos (h-h) ---
hh_opt = [600, 570, 637.4, 611, 640, 366.6]
hh_cen = [690, 870, 1199.7, 1187.9, 1005.2, 483.3]
hh_pes = [780, 1229, 1616.5, 1371.3, 1355, 776.6]
hh_real = [None, None, None, None, None, 387.4]

# =============================================================
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 9), height_ratios=[1, 1.2])

# ================== 1️⃣ LÍNEA DE TIEMPO ==================
series = [
    (fechas_opt, "Optimista", "green"),
    (fechas_cen, "Más probable", "pink"),
    (fechas_pes, "Pesimista", "red"),
    (fechas_real, "Real", "skyblue")
]
y_positions = [3, 2, 1, 0]

for (serie, label, color), y in zip(series, y_positions):
    fechas_validas = [d for d in serie if d is not None]
    est_validas = [i for i, d in enumerate(serie, start=1) if d is not None]
    ax1.plot(est_validas, [y]*len(est_validas), "o-", color=color, label=label)

    # Fechas completas sobre los puntos
    for i, f in zip(est_validas, fechas_validas):
        ax1.text(
            i, y + 0.15,
            f.strftime('%d/%m/%Y'),
            ha='center', va='bottom',
            fontsize=8.5, color='#0073e6', fontweight='bold'
        )

ax1.set_yticks(y_positions)
ax1.set_yticklabels(["Optimista", "Más probable", "Pesimista", "Real"])
ax1.set_xticks(estimaciones)
ax1.set_xlabel("Número de estimación")
ax1.set_xlim(0.5, len(estimaciones) + 0.5)
ax1.set_title("Línea de tiempo de fechas de finalización", fontsize=12, fontweight='bold')

# Fechas base debajo
y_label = -0.25
for i, fecha in enumerate(fechas_estimacion):
    ax1.text(
        i + 1, y_label,
        f"N°{i+1} = {fecha.strftime('%d/%m/%Y')}",
        ha='center', va='top',
        fontsize=9, color='black', fontstyle='italic'
    )

ax1.set_ylim(-0.6, 3.7)
ax1.grid(True, axis="x", linestyle="--", alpha=0.6)

# 🔹 Leyenda debajo del gráfico lineal (sin tocar el de barras)
ax1.legend(
    loc="upper center",
    bbox_to_anchor=(0.5, -0.32),   # <- espacio intermedio entre timeline y barras
    fancybox=True, shadow=False,
    ncol=4, fontsize=9,
    title="Tipos de estimación", title_fontsize=10
)

# ================== 2️⃣ GRÁFICO DE BARRAS ==================
width = 0.2
x = np.arange(len(labels))

ax2.bar(x - 1.5*width, hh_opt, width, label='Optimista', color='lightgreen')
ax2.bar(x - 0.5*width, hh_cen, width, label='Más probable', color='pink')
ax2.bar(x + 0.5*width, hh_pes, width, label='Pesimista', color='lightcoral')
ax2.bar(x + 1.5*width, [v if v else 0 for v in hh_real], width, label='Real', color='skyblue')

ax2.set_xticks(x)
ax2.set_xticklabels(labels)
ax2.set_ylabel("Horas-hombre")
ax2.set_title("Comparación de esfuerzo (h-h) por estimación", fontsize=12, fontweight='bold')

for bars in ax2.containers:
    ax2.bar_label(bars, fmt="%.0f", label_type='edge', fontsize=8)

ax2.grid(True, axis="y", linestyle="--", alpha=0.6)

# === Ajustes generales ===
plt.tight_layout()
plt.subplots_adjust(top=0.93, bottom=0.08, hspace=0.75)
fig.suptitle("Proyecto Kairos - Estimaciones y Caso Real", fontsize=14, fontweight='bold', y=0.99)
plt.show()

