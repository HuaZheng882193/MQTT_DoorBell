import { GoogleGenAI } from "@google/genai";
import { SimulationState } from "../types";

// Helper to get API key safely across different environments (Vite vs Node/Playground)
const getApiKey = () => {
  // @ts-ignore - Check for Vite environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  // Check for standard process.env (if available in current runner)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const generateLabAssistance = async (
  history: { role: string; text: string }[],
  currentMessage: string,
  simState: SimulationState
): Promise<string> => {
  try {
    const systemPrompt = `
你是一位友善且知识渊博的计算机科学实验室助手，面向八年级学生。
学生正在使用一个“物联网智能门铃模拟软件”来学习 MQTT 协议 (消息队列遥测传输)。

当前模拟状态：
- 智能门铃电源: ${simState.doorbellPower ? '开启 (ON)' : '关闭 (OFF)'}
- MQTT 代理服务器 (Broker): ${simState.serverOnline ? '在线 (ONLINE)' : '离线 (OFFLINE)'}
- 手机 App: ${simState.phoneConnected ? '已连接/已订阅 (CONNECTED)' : '断开/未订阅 (DISCONNECTED)'}
- 门铃正在响: ${simState.isRinging ? '是' : '否'}

你需要教授的关键概念：
1. **发布者 (Publisher - 门铃)**: 当发生事件（如按下按钮）时发送消息。
2. **代理服务器 (Broker - 服务器)**: 像“邮局”一样，接收消息并进行分发。
3. **订阅者 (Subscriber - 手机)**: 告诉代理服务器“我想接收关于门铃的消息”。
4. **主题 (Topic)**: 特定的频道名称，这里是 "home/doorbell"。

你的目标是：
1. 用中文回答关于物联网设备如何通过互联网通信的问题。
2. 如果模拟无法工作，引导他们检查依赖链：电源 -> 启动服务器 -> 手机订阅 -> 按下按钮。
3. 解释要简单易懂。使用类比，例如“代理服务器就像微信群的服务器”。
4. 解释 MQTT 是轻量级且快速的，非常适合像门铃这样的小型设备。

不要使用过于技术性的代码。专注于数据流向：
按钮按下 -> 数据包 -> WiFi -> 互联网 -> MQTT 代理服务器 -> 互联网 -> 手机 App。
`;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemPrompt,
      },
      history: history.map(h => ({
        role: h.role as 'user' | 'model',
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: currentMessage });
    return result.text || "我现在有点思考困难，请再问一次！";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "连接实验室服务器时出现问题，请检查你的网络连接。";
  }
};