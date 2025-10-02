import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# --- Datos de entrada ---
fechas_estimacion = [
    datetime(2025, 9, 18),
    datetime(2025, 9, 25),
    datetime(2025, 9, 28),
    # Agrega más fechas acá a medida que hagan estimaciones
]
caso_probable = [
    2.3,
    2.9,
    2.6
    # Agrega más valores acá a medida que hagan estimaciones
]
optimista_meses = [
    2.0,
    1.9,
    0.8
    # Agrega más valores acá a medida que hagan estimaciones
]
pesimista_meses = [
    2.6,
    4.0,
    3.9
    # Agrega más valores acá a medida que hagan estimaciones
]
dias_por_mes = 30

# --- Cálculo automático de estimaciones ---
estimaciones = list(range(1, len(fechas_estimacion) + 1))
optimistas, centrales, pesimistas = [], [], []

for i in range(len(fechas_estimacion)):
    optimistas.append(fechas_estimacion[i] + timedelta(days=optimista_meses[i] * dias_por_mes))
    centrales.append(fechas_estimacion[i] + timedelta(days=caso_probable[i] * dias_por_mes))
    pesimistas.append(fechas_estimacion[i] + timedelta(days=pesimista_meses[i] * dias_por_mes))

# --- Gráfico ---
fig, ax1 = plt.subplots(figsize=(9,6))

ax1.fill_between(estimaciones, optimistas, pesimistas, color="lightblue", alpha=0.4, label="Incertidumbre")
ax1.plot(estimaciones, centrales, "o-", color="pink", label="Más probable")
ax1.plot(estimaciones, optimistas, "go--", label="Optimista")
ax1.plot(estimaciones, pesimistas, "ro--", label="Pesimista")

# Etiquetas en los puntos
for i, fecha in enumerate(centrales):
    ax1.annotate(fecha.strftime('%d/%m/%Y'), (estimaciones[i], centrales[i]), textcoords="offset points", xytext=(0,10), ha='center', fontsize=9, color='black')
for i, fecha in enumerate(pesimistas):
    ax1.annotate(fecha.strftime('%d/%m/%Y'), (estimaciones[i], pesimistas[i]), textcoords="offset points", xytext=(0,10), ha='center', fontsize=9, color='black')
for i, fecha in enumerate(optimistas):
    ax1.annotate(fecha.strftime('%d/%m/%Y'), (estimaciones[i], optimistas[i]), textcoords="offset points", xytext=(0,10), ha='center', fontsize=9, color='black')

ax1.set_xlabel("Estimaciones")
ax1.set_ylabel("Fecha estimada de finalización")
ax1.set_xticks(estimaciones)
ax1.set_xticklabels([fecha.strftime('%d/%m/%Y') for fecha in fechas_estimacion])
ax1.set_title("Proyecto Kairos - Estimación")

lns1, labs1 = ax1.get_legend_handles_labels()
ax1.legend(lns1, labs1, loc="upper left", bbox_to_anchor=(1.05, 1), title="Esfuerzo total: 2,6 m")
plt.grid(True, linestyle="--", alpha=0.6)
plt.tight_layout()
plt.show()

