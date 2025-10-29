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

  // ALWAYS use your Render backend endpoint in production
  const API_BASE = "https://kerala-crop-prediction1.onrender.com";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPredictions([]);

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
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
      setError("Network error – is Render backend running?");
    } finally {
      setLoading(false);
    }
  };

  const rankEmoji = (i) => ["1st Place", "2nd Place", "3rd Place", "4th Place", "5th Place"][i] ?? "Leaf";
  const confidenceBadge = (p) => {
    if (p >= 15) return { cls: "bg-emerald-500 text-white", txt: "High", icon: "Strong" };
    if (p >= 10) return { cls: "bg-amber-500 text-white", txt: "Medium", icon: "Moderate" };
    return { cls: "bg-rose-500 text-white", txt: "Low", icon: "Weak" };
  };

  const cropIcons = {
    "rice": "Rice",
    "maize": "Corn",
    "jute": "Fiber",
    "cotton": "Cotton",
    "coconut": "Coconut",
    "papaya": "Papaya",
    "orange": "Orange",
    "apple": "Apple",
    "muskmelon": "Melon",
    "watermelon": "Watermelon",
    "grapes": "Grapes",
    "mango": "Mango",
    "banana": "Banana",
    "pomegranate": "Pomegranate",
    "lentil": "Lentil",
    "blackgram": "Bean",
    "mungbean": "Mung",
    "mothbeans": "Bean",
    "pigeonpeas": "Pea",
    "kidneybeans": "Bean",
    "chickpea": "Chickpea",
    "coffee": "Coffee"
  };

  const inputs = [
    { name: "nitrogen", label: "Nitrogen", icon: <Zap className="w-5 h-5" />, unit: "kg/ha", min: 0, max: 300, color: "from-green-400 to-emerald-600" },
    { name: "phosphorus", label: "Phosphorus", icon: <Beaker className="w-5 h-5" />, unit: "kg/ha", min: 0, max: 200, color: "from-blue-400 to-cyan-600" },
    { name: "potassium", label: "Potassium", icon: <Leaf className="w-5 h-5" />, unit: "kg/ha", min: 0, max: 400, color: "from-purple-400 to-pink-600" },
    { name: "temperature", label: "Temperature", icon: <Thermometer className="w-5 h-5" />, unit: "°C", min: 10, max: 45, color: "from-orange-400 to-red-600" },
    { name: "humidity", label: "Humidity", icon: <Droplets className="w-5 h-5" />, unit: "%", min: 0, max: 100, color: "from-sky-400 to-blue-600" },
    { name: "ph", label: "Soil pH", icon: <Beaker className="w-5 h-5" />, unit: "pH", min: 4, max: 9, color: "from-indigo-400 to-purple-600" },
    { name: "rainfall", label: "Rainfall", icon: <CloudRain className="w-5 h-5" />, unit: "mm", min: 0, max: 3000, color: "from-teal-400 to-cyan-600" },
  ];

  return (
    <>
      {/* ... rest of your code stays the same ... */}
      {/* Just be sure every fetch uses API_BASE */}
    </>
  );
}
