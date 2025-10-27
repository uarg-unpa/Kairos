import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# --- Datos de entrada ---
fechas_estimacion = [
    datetime(2025, 9, 18),
    datetime(2025, 9, 25),
    datetime(2025, 9, 28),
    datetime(2025, 10, 11)
]
caso_probable = [2.3, 2.9, 6.8, 5.1]
optimista_meses = [2.0, 1.9, 3.6, 3.2]
pesimista_meses = [2.6, 4.1, 7.3, 6.9]

dias_por_mes = 30

# --- Cálculo de fechas ---
estimaciones = list(range(1, len(fechas_estimacion) + 1))
optimistas, centrales, pesimistas = [], [], []

for i in range(len(fechas_estimacion)):
    optimistas.append(fechas_estimacion[i] + timedelta(days=optimista_meses[i] * dias_por_mes))
    centrales.append(fechas_estimacion[i] + timedelta(days=caso_probable[i] * dias_por_mes))
    pesimistas.append(fechas_estimacion[i] + timedelta(days=pesimista_meses[i] * dias_por_mes))

# --- Horas-hombre definidas manualmente ---
# (Reemplazá estos valores por tus cálculos reales)
hh_optimista = [600, 570, 637.4, 611]   # ejemplo
hh_central   = [690, 870, 1199.7, 1187.9]  # ejemplo
hh_pesimista = [780, 1229, 1616.5, 1371.3]  # ejemplo

# --- Gráfico ---
fig, ax1 = plt.subplots(figsize=(9,6))

ax1.plot(estimaciones, centrales, "o-", color="pink", label="Más probable")
ax1.plot(estimaciones, optimistas, "go--", label="Optimista")
ax1.plot(estimaciones, pesimistas, "ro--", label="Pesimista")

# --- Etiquetas (fecha + h/h) ---
for i, (fecha, hh) in enumerate(zip(centrales, hh_central)):
    ax1.annotate(f"{fecha.strftime('%d/%m/%Y')}\n{hh}h/h",
                 (estimaciones[i], centrales[i]), textcoords="offset points",
                 xytext=(0,10), ha='center', fontsize=9, color='black')

for i, (fecha, hh) in enumerate(zip(optimistas, hh_optimista)):
    ax1.annotate(f"{fecha.strftime('%d/%m/%Y')}\n{hh}h/h",
                 (estimaciones[i], optimistas[i]), textcoords="offset points",
                 xytext=(0,10), ha='center', fontsize=9, color='black')

for i, (fecha, hh) in enumerate(zip(pesimistas, hh_pesimista)):
    ax1.annotate(f"{fecha.strftime('%d/%m/%Y')}\n{hh}h/h",
                 (estimaciones[i], pesimistas[i]), textcoords="offset points",
                 xytext=(0,10), ha='center', fontsize=9, color='black')

# --- Estética general ---
ax1.set_title("Proyecto Kairos - Estimación", pad=40, fontsize=13, fontweight='bold')
ax1.set_ylabel("Fecha estimada de finalización")
ax1.set_xticks(estimaciones)
ax1.set_xticklabels([fecha.strftime('%d/%m/%Y') for fecha in fechas_estimacion])

ax1.legend(loc="upper left", bbox_to_anchor=(1.05, 1),
           title="Esfuerzo total")

plt.grid(True, linestyle="--", alpha=0.6)
plt.tight_layout()
plt.subplots_adjust(top=0.85)  # <-- más espacio arriba
plt.show()