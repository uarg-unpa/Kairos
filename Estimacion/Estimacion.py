import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# --- Datos de entrada ---
fechas_estimacion = [
    datetime(2025, 9, 18),
    datetime(2025, 9, 25),
    datetime(2025, 9, 28),
    datetime(2025, 10, 11)
]
caso_probable = [2.3, 2.9, 2.6, 2.5]
optimista_meses = [2.0, 1.9, 1.7, 1.6]
pesimista_meses = [2.6, 4.1, 3.9, 3.7]

dias_por_mes = 30
personas = 5
horas_por_dia = 2  # Horas de jornada laboral

# --- Cálculo de fechas ---
estimaciones = list(range(1, len(fechas_estimacion) + 1))
optimistas, centrales, pesimistas = [], [], []

for i in range(len(fechas_estimacion)):
    optimistas.append(fechas_estimacion[i] + timedelta(days=optimista_meses[i] * dias_por_mes))
    centrales.append(fechas_estimacion[i] + timedelta(days=caso_probable[i] * dias_por_mes))
    pesimistas.append(fechas_estimacion[i] + timedelta(days=pesimista_meses[i] * dias_por_mes))

# --- Cálculo de horas-hombre (h-h = personas * horas * días) para cada estimación ---
hh_optimista = [personas * horas_por_dia * (m * dias_por_mes) for m in optimista_meses]
hh_central = [personas * horas_por_dia * (m * dias_por_mes) for m in caso_probable]
hh_pesimista = [personas * horas_por_dia * (m * dias_por_mes) for m in pesimista_meses]

# --- Gráfico ---
fig, ax1 = plt.subplots(figsize=(9,6))

ax1.plot(estimaciones, centrales, "o-", color="pink", label=f"Más probable \n 12.5 m /5 = 2.5")
ax1.plot(estimaciones, optimistas, "go--", label=f"Optimista \n 8.0 m /5 = 1.6")
ax1.plot(estimaciones, pesimistas, "ro--", label=f"Pesimista \n 18.7 m /5 = 3.7")

# --- Etiquetas en cada punto (fecha + h/h) ---
for i, (fecha, hh) in enumerate(zip(centrales, hh_central)):
    ax1.annotate(f"{fecha.strftime('%d/%m/%Y')}\n{int(hh)}h/h",
                 (estimaciones[i], centrales[i]),
                 textcoords="offset points", xytext=(0,10), ha='center', fontsize=9, color='black')

for i, (fecha, hh) in enumerate(zip(optimistas, hh_optimista)):
    ax1.annotate(f"{fecha.strftime('%d/%m/%Y')}\n{int(hh)}h/h",
                 (estimaciones[i], optimistas[i]),
                 textcoords="offset points", xytext=(0,10), ha='center', fontsize=9, color='black')

for i, (fecha, hh) in enumerate(zip(pesimistas, hh_pesimista)):
    ax1.annotate(f"{fecha.strftime('%d/%m/%Y')}\n{int(hh)}h/h",
                 (estimaciones[i], pesimistas[i]),
                 textcoords="offset points", xytext=(0,10), ha='center', fontsize=9, color='black')

# --- Estética general ---
ax1.set_xlabel("Estimaciones")
ax1.set_ylabel("Fecha estimada de finalización")
ax1.set_xticks(estimaciones)
ax1.set_xticklabels([fecha.strftime('%d/%m/%Y') for fecha in fechas_estimacion])
ax1.set_title("Proyecto Kairos - Estimación")

# Leyenda
lns1, labs1 = ax1.get_legend_handles_labels()
ax1.legend(lns1, labs1, loc="upper left", bbox_to_anchor=(1.05, 1), title="Esfuerzo total / 5 integrantes:")

plt.grid(True, linestyle="--", alpha=0.6)
plt.tight_layout()
plt.show()

