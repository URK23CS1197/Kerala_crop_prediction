import { useState } from "react";
import { Leaf, CloudRain, Thermometer, Droplets, Beaker, Zap } from "lucide-react";

export default function App() {
  const [form, setForm] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [predictions, setPredictions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Allow only numeric values or empty string
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setForm((prev) => ({ ...prev, [name]: value }));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation: Ensure all fields are filled and within range
    for (const field of Object.keys(form)) {
      if (form[field] === "") {
        setError(`Please enter ${field}`);
        return;
      }
    }

    setLoading(true);
    setError("");
    setPredictions([]);

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(form).map(([k, v]) => [k, parseFloat(v)])
          )
        ),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${text || response.statusText}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.predictions)) {
        setPredictions(data.predictions);

        if (typeof window.confetti === "function") {
          window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        setError(data.error || "Prediction failed");
      }
    } catch (err) {
      setError(err.message || "Network error – is Flask running on http://localhost:5000?");
    } finally {
      setLoading(false);
    }
  };

  const rankEmoji = (i) =>
    ["1st Place", "2nd Place", "3rd Place", "4th Place", "5th Place"][i] ?? "Leaf";

  const confidenceBadge = (p) => {
    if (p >= 15) return { cls: "bg-emerald-500 text-white", txt: "High", icon: "Strong" };
    if (p >= 10) return { cls: "bg-amber-500 text-white", txt: "Medium", icon: "Moderate" };
    return { cls: "bg-rose-500 text-white", txt: "Low", icon: "Weak" };
  };

  const cropIcons = {
    rice: "Rice",
    maize: "Corn",
    jute: "Fiber",
    cotton: "Cotton",
    coconut: "Coconut",
    papaya: "Papaya",
    orange: "Orange",
    apple: "Apple",
    muskmelon: "Melon",
    watermelon: "Watermelon",
    grapes: "Grapes",
    mango: "Mango",
    banana: "Banana",
    pomegranate: "Pomegranate",
    lentil: "Lentil",
    blackgram: "Bean",
    mungbean: "Mung",
    mothbeans: "Bean",
    pigeonpeas: "Pea",
    kidneybeans: "Bean",
    chickpea: "Chickpea",
    coffee: "Coffee"
  };

  const inputs = [
    { name: "nitrogen", label: "Nitrogen", icon: <Zap className="w-5 h-5" />, unit: "kg/ha", min: 0, max: 300, color: "from-green-400 to-emerald-600" },
    { name: "phosphorus", label: "Phosphorus", icon: <Beaker className="w-5 h-5" />, unit: "kg/ha", min: 0, max: 200, color: "from-blue-400 to-cyan-600" },
    { name: "potassium", label: "Potassium", icon: <Leaf className="w-5 h-5" />, unit: "kg/ha", min: 0, max: 400, color: "from-purple-400 to-pink-600" },
    { name: "temperature", label: "Temperature", icon: <Thermometer className="w-5 h-5" />, unit: "°C", min: 10, max: 45, color: "from-orange-400 to-red-600" },
    { name: "humidity", label: "Humidity", icon: <Droplets className="w-5 h-5" />, unit: "%", min: 0, max: 100, color: "from-sky-400 to-blue-600" },
    { name: "ph", label: "Soil pH", icon: <Beaker className="w-5 h-5" />, unit: "pH", min: 4, max: 9, color: "from-indigo-400 to-purple-600" },
    { name: "rainfall", label: "Rainfall", icon: <CloudRain className="w-5 h-5" />, unit: "mm", min: 0, max: 3000, color: "from-teal-400 to-cyan-600" }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-green-300 to-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tr from-cyan-300 to-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Hero Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700">
              Kerala Crop Recommender
            </h1>
            <p className="mt-3 text-lg md:text-xl text-gray-700 font-medium">
              AI-Powered <span className="text-emerald-600">Top 5 Crop Suggestions</span> for Your Land
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <Leaf key={i} className={`w-6 h-6 text-emerald-500 animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>

          {/* Input Card */}
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-6 md:p-8 mb-8 border border-white/50">
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
              {inputs.map((field) => (
                <div key={field.name} className="relative group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${field.color} text-white shadow-lg`}>
                      {field.icon}
                    </div>
                    <label className="text-sm font-semibold text-gray-700">
                      {field.label} <span className="text-gray-500 font-normal">({field.unit})</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    name={field.name}
                    min={field.min}
                    max={field.max}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-transparent focus:ring-4 focus:ring-${field.color.split(' ')[1]}/30 outline-none transition-all bg-white/70 backdrop-blur`}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    value={form[field.name]}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 top-12 text-xs text-gray-400">
                    {field.min}–{field.max}
                  </span>
                </div>
              ))}

              <div className="md:col-span-2 flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Analyzing Soil & Climate...
                    </>
                  ) : (
                    <>Get Smart Crop Suggestions</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      nitrogen: "",
                      phosphorus: "",
                      potassium: "",
                      temperature: "",
                      humidity: "",
                      ph: "",
                      rainfall: ""
                    })
                  }
                  className="btn btn-ghost border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
                >
                  Reset All
                </button>
              </div>
            </form>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error shadow-lg backdrop-blur bg-red-500/90 text-white mb-6 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Results */}
          {predictions.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-700">
                Top 5 Recommended Crops
              </h2>

              <div className="grid gap-5">
                {predictions.map((p, i) => {
                  const badge = confidenceBadge(p.probability);
                  const icon = cropIcons[p.crop.toLowerCase()] || "Leaf";
                  return (
                    <div
                      key={i}
                      className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/50 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl"
                      style={{ animation: `fadeInUp 0.6s ease-out forwards`, animationDelay: `${i * 0.15}s` }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${i === 0 ? 'from-yellow-400 via-amber-500 to-orange-500' : i === 1 ? 'from-gray-300 to-gray-500' : i === 2 ? 'from-orange-400 to-red-500' : 'from-green-400 to-emerald-600'} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl -z-10 blur-xl`}></div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="text-5xl animate-bounce">{rankEmoji(i)}</div>
                          <div>
                            <div className="text-2xl font-bold capitalize flex items-center gap-2">
                              {icon} {p.crop}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-600">Rank #{i + 1}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.cls}`}>
                                {badge.icon} {badge.txt} Confidence
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
                            {p.probability}%
                          </div>
                          <div className="text-sm text-gray-600">Suitability Score</div>
                        </div>
                      </div>

                      <progress
                        className={`progress w-full h-4 mt-4 rounded-full ${
                          p.probability >= 15 ? 'progress-success' : p.probability >= 10 ? 'progress-warning' : 'progress-error'
                        }`}
                        value={p.probability}
                        max="100"
                      ></progress>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-8">
                <p className="text-sm text-gray-600">
                  Based on NPK, climate, and soil data • Powered by Machine Learning
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 1s ease-out; }
      `}</style>

      {/* Confetti Script */}
      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    </>
  );
}
