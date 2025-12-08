import React, { useState } from "react";
import { DoorbellSimulation } from "./components/DoorbellSimulation";
import { ChatInterface } from "./components/ChatInterface";
import { SimulationState } from "./types";
import { BookOpen, RefreshCcw } from "lucide-react";

const INITIAL_STATE: SimulationState = {
  doorbellPower: false,
  serverOnline: false,
  serverLogs: ["系统初始化完成... 等待服务启动。"],
  phoneConnected: false,
  isPressing: false,
  isRinging: false,
  packetLocation: "idle",
};

export default function App() {
  const [simState, setSimState] = useState<SimulationState>(INITIAL_STATE);

  const handleStateChange = (updates: Partial<SimulationState>) => {
    setSimState((prev) => {
      // If we are resetting logs, handle that specifically or just merge
      return { ...prev, ...updates };
    });
  };

  const resetSimulation = () => {
    setSimState(INITIAL_STATE);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800">
              物联网实验室：MQTT 智能门铃
            </h1>
            <p className="text-xs text-slate-500">八年级 • 物联网与协议</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            重置实验
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Simulation Area */}
        <main className="flex-1 relative z-0">
          <DoorbellSimulation
            state={simState}
            onStateChange={handleStateChange}
          />
        </main>

        {/* Right: AI Assistant */}
        {/* <aside className="w-96 border-l border-slate-200 bg-white shadow-xl z-10 flex flex-col absolute right-0 top-0 bottom-0 md:relative translate-x-full md:translate-x-0 transition-transform duration-300" style={{ transform: 'none' }}>
           <ChatInterface simState={simState} />
        </aside> */}
      </div>
    </div>
  );
}
