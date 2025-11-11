import matplotlib.pyplot as plt
import numpy as np

estimaciones = np.arange(1, 7)
optimista = [2.0, 1.9, 3.6, 3.2, 2.9, 1.7]
probable  = [2.3, 2.9, 6.8, 5.1, 4.6, 2.2]
pesimista = [2.6, 4.1, 7.3, 6.9, 6.2, 3.5]
real      = [None, None, None, None, None, 1.8]

fig, ax = plt.subplots(figsize=(10,6))

ax.fill_between(estimaciones, pesimista, optimista, color='#cce5ff', alpha=0.4, label="Rango de incertidumbre (Cono)")
ax.plot(estimaciones, optimista, 'g--o', label='Optimista')
ax.plot(estimaciones, probable, color='#e60073', marker='o', label='Más probable', linewidth=2)
ax.plot(estimaciones, pesimista, 'r--o', label='Pesimista')
ax.plot([5,6], [real[4], real[5]], 'o-', color='#0073e6', label='Real', linewidth=2.3)

for i, val in enumerate(probable):
    ax.text(i+1, val+0.25, f"{val:.1f} m", ha='center', fontsize=9, color='black')

ax.set_title("Gráfico de estimaciones", fontsize=13, fontweight='bold', color='#e60073')
ax.set_xlabel("Número de estimación")
ax.set_ylabel("Duración estimada (meses)")
ax.set_xticks(estimaciones)
ax.grid(True, linestyle="--", alpha=0.5)
ax.legend(loc="upper right", frameon=True)

plt.tight_layout()
plt.show()

#------------------------------------Gráfico estimaciones (lineal con fechas)------------------------------
from datetime import datetime, timedelta

fechas_estimacion = [
    datetime(2025, 9, 18),
    datetime(2025, 9, 25),
    datetime(2025, 9, 28),
    datetime(2025, 10, 11),
    datetime(2025, 11, 4),
    datetime(2025, 11, 7)
]
caso_probable = [2.3, 2.9, 6.8, 5.1, 4.6, 2.2]
optimista = [2.0, 1.9, 3.6, 3.2, 2.9, 1.7]
pesimista = [2.6, 4.1, 7.3, 6.9, 6.2, 3.5]
real = [None, None, None, None, None, 1.8]
dias_por_mes = 30

def add_meses(base, meses):
    return [b + timedelta(days=m * dias_por_mes) if m else None for b, m in zip(base, meses)]

fechas_opt = add_meses(fechas_estimacion, optimista)
fechas_cen = add_meses(fechas_estimacion, caso_probable)
fechas_pes = add_meses(fechas_estimacion, pesimista)
fechas_real = add_meses(fechas_estimacion, real)

estimaciones = np.arange(1, len(fechas_estimacion) + 1)
series = [
    (fechas_opt, "Optimista", "green"),
    (fechas_cen, "Más probable", "#e60073"),
    (fechas_pes, "Pesimista", "red"),
    (fechas_real, "Real", "#0073e6")
]
y_positions = [3, 2, 1, 0]

fig, ax = plt.subplots(figsize=(10,6))
for (serie, label, color), y in zip(series, y_positions):
    fechas_validas = [d for d in serie if d is not None]
    est_validas = [i for i, d in enumerate(serie, start=1) if d is not None]
    ax.plot(est_validas, [y]*len(est_validas), "o-", color=color, label=label)
    for i, f in zip(est_validas, fechas_validas):
        ax.text(i, y + 0.15, f.strftime('%d/%m/%Y'), ha='center', va='bottom', fontsize=9, color='#0073e6')

ax.set_yticks(y_positions)
ax.set_yticklabels(["Optimista", "Más probable", "Pesimista", "Real"])
ax.set_xticks(estimaciones)
ax.set_xlim(0.5, len(estimaciones) + 0.5)
ax.set_xlabel("Número de estimación")
ax.set_title("Línea de tiempo de fechas de finalización", fontsize=13, fontweight='bold', color='#e60073')

for i, fecha in enumerate(fechas_estimacion):
    ax.text(i + 1, -0.35, f"N°{i+1} = {fecha.strftime('%d/%m/%Y')}",
            ha='center', va='top', fontsize=9, color='black', fontstyle='italic')

ax.set_ylim(-0.6, 3.7)
ax.grid(True, axis="x", linestyle="--", alpha=0.6)
ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.25), ncol=4, fontsize=9)

plt.tight_layout()
plt.show()

#-------------------------------------Gráfico de comparión en horas hombre-----------------------------------

hh_opt = [600, 570, 637.4, 611, 640, 366.6]
hh_cen = [690, 870, 1199.7, 1187.9, 1005.2, 483.3]
hh_pes = [780, 1229, 1616.5, 1371.3, 1355, 776.6]
hh_real = [None, None, None, None, None, 387.4]

labels = [f"E{i}" for i in range(1, 7)]
x = np.arange(len(labels))
width = 0.2

fig, ax = plt.subplots(figsize=(10,6))
ax.bar(x - 1.5*width, hh_opt, width, label='Optimista', color='lightgreen')
ax.bar(x - 0.5*width, hh_cen, width, label='Más probable', color='pink')
ax.bar(x + 0.5*width, hh_pes, width, label='Pesimista', color='lightcoral')
ax.bar(x + 1.5*width, [v if v else 0 for v in hh_real], width, label='Real', color='skyblue')

ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.set_ylabel("Horas-hombre")
ax.set_title("Comparación de esfuerzo (h-h) por estimación", fontsize=13, fontweight='bold', color='#e60073')

for bars in ax.containers:
    ax.bar_label(bars, fmt="%.0f", label_type='edge', fontsize=8)

ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.15), ncol=4, fontsize=9)
ax.grid(True, axis="y", linestyle="--", alpha=0.6)

plt.tight_layout()
plt.show()
