// // tests/chat-websocket-direct.spec.ts
// import { test, expect } from "@playwright/test";
// import WebSocket from "ws";

// test("WebSocket direct: send and verify response", async () => {
//   const ws = new WebSocket("ws://localhost:8000/ws"); // Adjust path

//   const received: string[] = [];
//   await new Promise<void>((resolve, reject) => {
//     const timeout = setTimeout(() => reject(new Error("WS open timeout")), 5000);

//     ws.on("open", () => {
//       clearTimeout(timeout);
//       ws.send(JSON.stringify({ type: "user_message", content: "Hello from test" }));
//     });

//     ws.on("message", (data) => {
//       const text = Buffer.isBuffer(data) ? data.toString("utf-8") : String(data);
//       received.push(text);
//       try {
//         const j = JSON.parse(text);
//         if (j?.type === "final" && typeof j?.answer === "string" && j.answer.length > 0) {
//           ws.close();
//           resolve();
//         }
//       } catch {
//         // ignore non-JSON
//       }
//     });

//     ws.on("error", reject);
//     ws.on("close", () => resolve());
//   });

//   const gotFinal = received.some((r) => {
//     try {
//       const j = JSON.parse(r);
//       return j?.type === "final" && j?.answer;
//     } catch {
//       return false;
//     }
//   });
//   expect(gotFinal).toBeTruthy();
// });
