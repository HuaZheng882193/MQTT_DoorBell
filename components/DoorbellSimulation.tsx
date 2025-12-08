import React, { useEffect, useRef } from 'react';
import { Power, Server, Smartphone, Bell, Wifi, Activity, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { SimulationState } from '../types';

interface DoorbellSimulationProps {
  state: SimulationState;
  onStateChange: (newState: Partial<SimulationState>) => void;
}

export const DoorbellSimulation: React.FC<DoorbellSimulationProps> = ({ state, onStateChange }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.serverLogs]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog = `[${timestamp}] ${msg}`;
    onStateChange({ serverLogs: [...state.serverLogs.slice(-6), newLog] });
  };

  const toggleDoorbellPower = () => {
    onStateChange({ doorbellPower: !state.doorbellPower });
    if (!state.doorbellPower) {
        // If turning on
        setTimeout(() => addLog("设备 'Doorbell-01' 已连接到 WiFi"), 1000);
    }
  };

  const toggleServer = () => {
    const newStatus = !state.serverOnline;
    onStateChange({ serverOnline: newStatus });
    if (newStatus) {
        addLog("MQTT 代理服务已启动 (端口 1883)");
    } else {
        addLog("MQTT 代理服务已停止");
        onStateChange({ phoneConnected: false }); // Phone loses connection if server dies
    }
  };

  const togglePhoneSubscription = () => {
    if (!state.serverOnline) return; // Can't connect if server is down
    const newStatus = !state.phoneConnected;
    onStateChange({ phoneConnected: newStatus });
    if (newStatus) {
        addLog("客户端 'iPhone-15' 已订阅主题 'home/doorbell'");
    } else {
        addLog("客户端 'iPhone-15' 已取消订阅");
    }
  };

  const handlePressButton = () => {
    if (!state.doorbellPower) return; // No power, no action
    
    onStateChange({ isPressing: true });

    // Logic: Power -> Server Online -> Publish
    if (state.doorbellPower && state.serverOnline) {
      onStateChange({ packetLocation: 'doorbell-to-server' });
      addLog("收到来自 'Doorbell-01' 的发布: 主题='home/doorbell' 内容='DING'");
      
      // Animation Step 1: Arrive at Server
      setTimeout(() => {
        onStateChange({ packetLocation: 'processing' });
        
        // Check subscriptions
        if (state.phoneConnected) {
            addLog("正在将消息路由给订阅者 'iPhone-15'");
             // Animation Step 2: Go to Phone
            setTimeout(() => {
                onStateChange({ packetLocation: 'server-to-phone' });
                
                // Animation Step 3: Phone Rings
                setTimeout(() => {
                    onStateChange({ isRinging: true, packetLocation: 'idle' });
                    // Stop ringing after 2s
                    setTimeout(() => onStateChange({ isRinging: false }), 2000);
                }, 800);
            }, 500);
        } else {
            addLog("主题 'home/doorbell' 没有订阅者。消息被丢弃。");
            setTimeout(() => onStateChange({ packetLocation: 'idle' }), 500);
        }

      }, 800);
    } else if (state.doorbellPower && !state.serverOnline) {
        // Power but no server
        // Maybe show error visual on doorbell?
    }
  };

  const handleReleaseButton = () => {
    onStateChange({ isPressing: false });
  };

  return (
    <div className="relative h-full w-full bg-slate-100 flex flex-col xl:flex-row items-center justify-between p-4 gap-4 overflow-y-auto">
      
      {/* Background decoration */}
      <div className="absolute inset-0 grid grid-cols-[1fr_2fr_1fr] opacity-[0.03] pointer-events-none">
         <div className="border-r border-slate-900 bg-slate-400"></div>
         <div className="border-r border-slate-900 bg-blue-400"></div>
         <div className="bg-slate-400"></div>
      </div>

      {/* --- SECTION 1: PUBLISHER (Doorbell) --- */}
      <div className="flex-1 w-full max-w-sm h-[500px] flex flex-col">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 flex-1 flex flex-col p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span>发布者 (Publisher)</span>
                </div>
                <div className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">设备: 门铃-01</div>
            </div>

            {/* Smart Doorbell Device Visual */}
            <div className="flex-1 bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between relative shadow-inner border-4 border-slate-300">
                {/* Camera Lens Hint */}
                <div className="w-12 h-12 rounded-full bg-black border-2 border-slate-600 shadow-lg relative mb-4">
                    <div className="absolute w-4 h-4 rounded-full bg-indigo-900/50 top-2 right-3"></div>
                    <div className="absolute w-2 h-2 rounded-full bg-blue-500/20 bottom-3 left-3"></div>
                </div>

                {/* Status Ring */}
                <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                    state.doorbellPower 
                        ? (state.serverOnline ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'border-amber-500 animate-pulse') 
                        : 'border-slate-600'
                }`}>
                    <button
                        className={`w-24 h-24 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center ${
                            state.isPressing ? 'bg-indigo-700 scale-95' : 'bg-indigo-600 hover:bg-indigo-500'
                        } ${!state.doorbellPower ? 'opacity-50 cursor-not-allowed bg-slate-600' : ''}`}
                        onMouseDown={handlePressButton}
                        onMouseUp={handleReleaseButton}
                        onTouchStart={handlePressButton}
                        onTouchEnd={handleReleaseButton}
                        disabled={!state.doorbellPower}
                    >
                        <Bell className="w-10 h-10 text-white" />
                    </button>
                </div>

                {/* Power Control */}
                <div className="w-full mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400">电源</span>
                        <span className={`text-[10px] ${state.doorbellPower ? 'text-green-400' : 'text-red-400'}`}>
                            {state.doorbellPower ? '电量充足' : '已关闭'}
                        </span>
                    </div>
                    <button 
                        onClick={toggleDoorbellPower}
                        className={`p-2 rounded-full transition-colors ${state.doorbellPower ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                    >
                        <Power className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Packet Animation Origin */}
            {state.packetLocation === 'doorbell-to-server' && (
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-50">
                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping absolute"></div>
                    <div className="w-4 h-4 bg-indigo-600 rounded-full relative shadow-lg"></div>
                </div>
            )}
        </div>
        <div className="text-center mt-3">
             <h3 className="font-bold text-slate-700">智能门铃</h3>
             <p className="text-xs text-slate-500">发布到 "home/doorbell"</p>
        </div>
      </div>

      {/* --- CONNECTION LINE 1 --- */}
      <div className="hidden xl:flex flex-col items-center justify-center w-16 text-slate-300">
         <div className={`h-1 w-full transition-colors duration-500 ${state.packetLocation === 'doorbell-to-server' ? 'bg-indigo-400' : 'bg-slate-300'}`}></div>
         <span className="text-[10px] mt-1">MQTT</span>
      </div>

      {/* --- SECTION 2: BROKER (Server) --- */}
      <div className="flex-1 w-full max-w-sm h-[500px] flex flex-col">
         <div className="bg-slate-900 rounded-lg shadow-2xl border border-slate-700 flex-1 flex flex-col p-1 relative overflow-hidden font-mono text-sm">
            {/* Server Header */}
            <div className="bg-slate-800 p-3 flex justify-between items-center rounded-t-lg border-b border-slate-700">
                <div className="flex items-center gap-2 text-emerald-400">
                    <Server className="w-4 h-4" />
                    <span className="font-bold">MQTT 代理服务器</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${state.serverOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-slate-400">{state.serverOnline ? '运行中' : '已停止'}</span>
                </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 bg-black/50 p-4 overflow-hidden flex flex-col gap-1 text-xs">
                {state.serverLogs.map((log, i) => (
                    <div key={i} className="text-slate-300 font-mono break-all border-l-2 border-slate-700 pl-2">
                        {log}
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>

            {/* Processing Animation */}
            {state.packetLocation === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                    <Activity className="w-12 h-12 text-emerald-400 animate-bounce" />
                </div>
            )}

            {/* Controls */}
            <div className="p-3 bg-slate-800 border-t border-slate-700">
                <button
                    onClick={toggleServer}
                    className={`w-full py-2 rounded font-bold transition-all ${
                        state.serverOnline 
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/50' 
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/50'
                    }`}
                >
                    {state.serverOnline ? '停止服务器' : '启动服务器'}
                </button>
            </div>

            {/* Outgoing Packet Animation */}
            {state.packetLocation === 'server-to-phone' && (
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-50">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute"></div>
                    <div className="w-4 h-4 bg-emerald-600 rounded-full relative shadow-lg"></div>
                </div>
            )}
         </div>
         <div className="text-center mt-3">
             <h3 className="font-bold text-slate-700">中间服务器</h3>
             <p className="text-xs text-slate-500">在设备间路由消息</p>
        </div>
      </div>

      {/* --- CONNECTION LINE 2 --- */}
      <div className="hidden xl:flex flex-col items-center justify-center w-16 text-slate-300">
         <div className={`h-1 w-full transition-colors duration-500 ${state.packetLocation === 'server-to-phone' ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
         <span className="text-[10px] mt-1">WiFi</span>
      </div>

      {/* --- SECTION 3: SUBSCRIBER (Phone) --- */}
      <div className="flex-1 w-full max-w-sm h-[500px] flex flex-col items-center">
        <div className="relative w-[280px] h-[500px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>

            {/* Screen Content */}
            <div className={`flex-1 flex flex-col bg-white relative ${state.isRinging ? 'animate-[pulse_0.5s_ease-in-out_infinite]' : ''}`}>
                
                {/* Status Bar */}
                <div className="h-8 bg-slate-100 w-full flex justify-between items-center px-6 pt-2 text-[10px] font-bold text-slate-800">
                    <span>9:41</span>
                    <div className="flex gap-1">
                        <Wifi className="w-3 h-3" />
                        <BatteryIcon percent={85} />
                    </div>
                </div>

                {/* App UI */}
                <div className="flex-1 flex flex-col p-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Database className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg text-slate-800">智能家居</span>
                    </div>

                    {/* Subscription Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">我的设备</h4>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${state.phoneConnected ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                <div>
                                    <p className="font-bold text-sm text-slate-700">前门</p>
                                    <p className="text-[10px] text-slate-400 font-mono">主题: home/doorbell</p>
                                </div>
                            </div>
                            <button 
                                onClick={togglePhoneSubscription}
                                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${
                                    state.phoneConnected 
                                    ? 'bg-red-100 text-red-600' 
                                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                }`}
                                disabled={!state.serverOnline}
                            >
                                {state.phoneConnected ? '退订' : '订阅'}
                            </button>
                        </div>
                    </div>

                    {/* Notification Area */}
                    <div className="mt-auto mb-12">
                        {state.isRinging ? (
                             <div className="bg-slate-900/90 backdrop-blur text-white p-4 rounded-2xl shadow-xl transform transition-all animate-bounce">
                                <div className="flex items-start gap-3">
                                    <div className="bg-amber-500 p-2 rounded-xl">
                                        <Bell className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">检测到动作</h4>
                                        <p className="text-xs text-slate-300">有人在按门铃！</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button className="flex-1 bg-white text-black py-2 rounded-lg text-xs font-bold">通话</button>
                                    <button className="flex-1 bg-slate-700 py-2 rounded-lg text-xs font-bold">忽略</button>
                                </div>
                             </div>
                        ) : (
                            <div className="text-center text-slate-300">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-xs">等待消息...</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
        <div className="text-center mt-3">
             <h3 className="font-bold text-slate-700">订阅者 (Subscriber)</h3>
             <p className="text-xs text-slate-500">监听主题消息</p>
        </div>
      </div>

    </div>
  );
};

const BatteryIcon = ({ percent }: { percent: number }) => (
    <div className="w-5 h-2.5 border border-slate-800 rounded-sm relative flex items-center p-0.5">
        <div className="h-full bg-slate-800" style={{ width: `${percent}%` }}></div>
        <div className="absolute -right-0.5 w-0.5 h-1 bg-slate-800 rounded-r-sm top-1/2 -translate-y-1/2"></div>
    </div>
);