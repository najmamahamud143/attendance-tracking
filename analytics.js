const reloadStats = document.getElementById("reloadStats");
const chartEmpty = document.getElementById("chartEmpty");
const chartFrame = document.getElementById("chartFrame");
const fallbackChart = document.getElementById("fallbackChart");
let attendanceChart = null;

initShell("analytics");

function toPercentage(item) {
  const total = Number(item.total_enrolled);
  const present = Number(item.present);
  if (!total) return 0;
  return Math.round((present / total) * 1000) / 10;
}

function renderFallback(labels, values) {
  fallbackChart.innerHTML = labels.map((label, index) => `
    <div class="fallback-bar">
      <strong>${escapeHtml(label)}</strong>
      <span class="bar-track"><span class="bar-fill" style="width: ${Math.max(0, Math.min(100, values[index]))}%"></span></span>
      <span>${escapeHtml(values[index])}%</span>
    </div>
  `).join("");
}

async function loadAnalytics() {
  try {
    clearMessage("analyticsMessage");
    const data = await apiFetch("/api/attendance-stats");

    if (!Array.isArray(data) || data.length === 0) {
      chartFrame.style.display = "none";
      fallbackChart.innerHTML = "";
      chartEmpty.style.display = "grid";
      chartEmpty.querySelector("div div").textContent = "No analytics data is available yet.";
      return;
    }

    const labels = data.map((item) => item.day || "Unknown");
    const values = data.map(toPercentage);
    chartEmpty.style.display = "none";
    chartFrame.style.display = "block";

    if (window.Chart) {
      fallbackChart.innerHTML = "";
      const ctx = document.getElementById("attendanceChart");
      if (attendanceChart) attendanceChart.destroy();
      attendanceChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Attendance %",
            data: values,
            backgroundColor: "#2563eb",
            borderRadius: 6,
            maxBarThickness: 58
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { callback: (value) => `${value}%` },
              title: { display: true, text: "Attendance Percentage" }
            },
            x: {
              title: { display: true, text: "Day" }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `${context.parsed.y}% attendance`
              }
            }
          }
        }
      });
    } else {
      chartFrame.style.display = "none";
      setMessage("analyticsMessage", "Chart.js could not load, so a simple bar summary is shown instead.", "info");
      renderFallback(labels, values);
    }
  } catch (error) {
    chartFrame.style.display = "none";
    chartEmpty.style.display = "grid";
    chartEmpty.querySelector("div div").textContent = "Unable to load analytics right now.";
    setMessage("analyticsMessage", error.message, "error");
  }
}

reloadStats.addEventListener("click", loadAnalytics);
loadAnalytics();
