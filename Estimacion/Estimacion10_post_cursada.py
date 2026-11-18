import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta

# ==============================================================================
# DATOS CONSOLIDADOS (E1 - E10)
# ==============================================================================
estimaciones = np.arange(1, 11)

# Duración estimada vs. duración real efectiva (en meses)
optimista = [2.0, 1.9, 3.6, 3.2, 2.9, 1.7, 0.7, 0.6, 0.6, 0.3]
probable  = [2.3, 2.9, 6.8, 5.1, 4.6, 2.2, 1.2, 1.0, 1.0, 0.5]
pesimista = [2.6, 4.1, 7.3, 6.9, 6.2, 3.5, 1.6, 1.3, 1.3, 0.7]
real      = [None, None, None, None, None, 1.8, 0.11, 0.16, 0.07, 0.08]

# Fechas de corte de cada estimación
fechas_estimacion = [
    datetime(2025, 9, 18),
    datetime(2025, 9, 25),
    datetime(2025, 9, 28),
    datetime(2025, 10, 11),
    datetime(2025, 11, 4),
    datetime(2025, 11, 7),
    datetime(2025, 11, 20),
    datetime(2026, 1, 23),
    datetime(2026, 3, 30),
    datetime(2026, 11, 5)
]

# Esfuerzo total en horas-hombre (h-h)
hh_opt  = [600, 570, 637.4, 611, 640, 366.6, 162.9, 133.8, 133.8, 66.0]
hh_cen  = [690, 870, 1199.7, 1187.9, 1005.2, 483.3, 255.9, 210.2, 210.2, 110.0]
hh_pes  = [780, 1229, 1616.5, 1371.3, 1355, 776.6, 345.1, 283.5, 283.5, 154.0]
hh_real = [None, None, None, None, None, 387.4, 25.1, 34.4, 14.8, 16.6]

# ------------------------------------------------------------------------------
# 1. GRÁFICO CONO DE INCERTIDUMBRE
# ------------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 6))

ax.fill_between(estimaciones, pesimista, optimista, color='#cce5ff', alpha=0.4, label="Rango de incertidumbre (Cono)")
ax.plot(estimaciones, optimista, 'g--o', label='Optimista')
ax.plot(estimaciones, probable, color='#e60073', marker='o', label='Más probable', linewidth=2)
ax.plot(estimaciones, pesimista, 'r--o', label='Pesimista')

idx_real = [i + 1 for i, v in enumerate(real) if v is not None]
val_real = [v for v in real if v is not None]
ax.plot(idx_real, val_real, 'o-', color='#0073e6', label='Real', linewidth=2.3)

for i, val in enumerate(probable):
    ax.text(i + 1, val + 0.25, f"{val:.1f} m", ha='center', fontsize=8.5, color='black')

ax.set_title("Gráfico de estimaciones (E1 - E10)", fontsize=13, fontweight='bold', color='#e60073')
ax.set_xlabel("Número de estimación")
ax.set_ylabel("Duración estimada (meses)")
ax.set_xticks(estimaciones)
ax.grid(True, linestyle="--", alpha=0.5)
ax.legend(loc="upper right", frameon=True)

plt.tight_layout()
plt.show()

# ------------------------------------------------------------------------------
# 2. GRÁFICO ESTIMACIONES (LINEAL CON FECHAS EXACTAS)
# ------------------------------------------------------------------------------
dias_por_mes = 30

def add_meses(base, meses):
    return [b + timedelta(days=m * dias_por_mes) if m is not None else None for b, m in zip(base, meses)]

fechas_opt = add_meses(fechas_estimacion, optimista)
fechas_cen = add_meses(fechas_estimacion, probable)
fechas_pes = add_meses(fechas_estimacion, pesimista)

# Fechas reales exactas de cierre de cada hito
fechas_real = [
    None, None, None, None, None,
    datetime(2025, 12, 31),
    datetime(2026, 1, 21),
    datetime(2026, 3, 20),
    datetime(2026, 6, 11),
    datetime(2026, 11, 17)
]

series = [
    (fechas_opt, "Optimista", "green"),
    (fechas_cen, "Más probable", "#e60073"),
    (fechas_pes, "Pesimista", "red"),
    (fechas_real, "Real", "#0073e6")
]
y_positions = [3, 2, 1, 0]

fig, ax = plt.subplots(figsize=(13, 6))
for (serie, label, color), y in zip(series, y_positions):
    fechas_validas = [d for d in serie if d is not None]
    est_validas = [i for i, d in enumerate(serie, start=1) if d is not None]
    ax.plot(est_validas, [y] * len(est_validas), "o-", color=color, label=label)
    for i, f in zip(est_validas, fechas_validas):
        ax.text(i, y + 0.15, f.strftime('%d/%m/%Y'), ha='center', va='bottom', fontsize=7.5, color='#0073e6')

ax.set_yticks(y_positions)
ax.set_yticklabels(["Optimista", "Más probable", "Pesimista", "Real"])
ax.set_xticks(estimaciones)
ax.set_xlim(0.5, len(estimaciones) + 0.5)
ax.set_xlabel("Número de estimación")
ax.set_title("Línea de tiempo de fechas de finalización (E1 - E10)", fontsize=13, fontweight='bold', color='#e60073')

for i, fecha in enumerate(fechas_estimacion):
    ax.text(i + 1, -0.35, f"N°{i+1}\n{fecha.strftime('%d/%m/%y')}",
            ha='center', va='top', fontsize=7.5, color='black', fontstyle='italic')

ax.set_ylim(-0.65, 3.7)
ax.grid(True, axis="x", linestyle="--", alpha=0.6)
ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.25), ncol=4, fontsize=9)

plt.tight_layout()
plt.show()

# ------------------------------------------------------------------------------
# 3. GRÁFICO DE COMPARACIÓN EN HORAS-HOMBRE
# ------------------------------------------------------------------------------
labels = [f"E{i}" for i in range(1, 11)]
x = np.arange(len(labels))
width = 0.2

fig, ax = plt.subplots(figsize=(13, 6))
ax.bar(x - 1.5 * width, hh_opt, width, label='Optimista', color='lightgreen')
ax.bar(x - 0.5 * width, hh_cen, width, label='Más probable', color='pink')
ax.bar(x + 0.5 * width, hh_pes, width, label='Pesimista', color='lightcoral')
ax.bar(x + 1.5 * width, [v if v is not None else 0 for v in hh_real], width, label='Real', color='skyblue')

ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.set_ylabel("Horas-hombre")
ax.set_title("Comparación de esfuerzo (h-h) por estimación (E1 - E10)", fontsize=13, fontweight='bold', color='#e60073')

for bars in ax.containers:
    ax.bar_label(bars, fmt="%.0f", label_type='edge', fontsize=7)

ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.15), ncol=4, fontsize=9)
ax.grid(True, axis="y", linestyle="--", alpha=0.6)

plt.tight_layout()
plt.show()