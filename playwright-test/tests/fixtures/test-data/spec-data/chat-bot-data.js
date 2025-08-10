module.exports = {
  userInputs: {
    greetingMessage: {
      question: "Welcome to the world of AI!",
      answer:
        "Welcome to the world of AI! I'm here to help you explore ideas, answer your questions, and guide you through anything you’d like to learn. What would you like to discover today?",
    },
    invalidGreetingMessage: {
      question: "Invalid message",
      answer: "Sorry, Question is not applicable to the documents submitted.",
    },
  },

  questions: [
    "What is an NVIDIA RTX graphics card?",
    "What is the difference between RTX and GTX?",
    "What does “RTX” stand for?",
    "What is ray tracing in RTX cards?",
    "What is DLSS and how does it work?",
    "Which RTX card is good for gaming?",
  ],

  // Use these for exact-match assertions (we'll normalize whitespace in the spec)
  expectedAnswers: [
    "An NVIDIA RTX graphics card is a high-performance GPU designed for gaming, content creation, and AI applications, featuring real-time ray tracing and DLSS technology. It includes dedicated RT Cores for ray tracing and Tensor Cores for AI operations, enhancing graphical performance and realism. RTX cards are part of NVIDIA's GeForce lineup and utilize advanced architectures like Turing, Ampere, and Ada Lovelace.",
    "The main difference between RTX and GTX graphics cards is that RTX cards support advanced features like real-time ray tracing and DLSS, while GTX cards focus on traditional raster-based rendering. RTX cards include dedicated RT Cores for ray tracing and Tensor Cores for AI operations, which GTX cards do not have. In summary, RTX offers more powerful and modern graphical capabilities compared to the legacy performance of GTX.",
    "“RTX” stands for Ray Tracing Texel eXtreme. It highlights the graphics card's capabilities for real-time ray tracing, enhancing realism in graphics. RTX cards are designed to handle advanced rendering techniques efficiently.",
    "Ray tracing in RTX cards is a rendering technique that simulates how light interacts with surfaces to create realistic shadows, reflections, and lighting. RTX cards are equipped with dedicated RT Cores that enable real-time ray tracing, enhancing visual fidelity in games and applications. This technology allows for more realistic graphics but is computationally intensive, which is why RTX cards are designed to handle it efficiently.",
    "DLSS (Deep Learning Super Sampling) is an AI-powered technology developed by NVIDIA that enhances game performance by rendering fewer pixels and then using deep learning to upscale the image to a higher resolution. This process allows for higher frame rates with minimal loss in image quality. DLSS utilizes the Tensor Cores in NVIDIA RTX graphics cards to perform real-time upscaling.DLSS (Deep Learning Super Sampling) is an AI-powered technology that increases game performance by rendering fewer pixels and then using deep learning to upscale the image to a higher resolution. This allows gamers to get higher frame rates with minimal loss in image quality. DLSS uses the Tensor Cores in RTX cards to perform the upscaling in real-time.",
    "For budget gamers, the RTX 4060 or RTX 3060 is recommended. For 1440p gaming, consider the RTX 4070 or RTX 4070 Ti. For 4K gaming and future-proofing, the RTX 4080 or RTX 4090 would be ideal.",
  ],
};
