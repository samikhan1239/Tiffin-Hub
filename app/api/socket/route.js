import { initSocket } from "@/lib/socket";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Socket.IO initialization is handled in a custom server or separate setup
    // This route confirms initialization or triggers it if needed
    const io = initSocket(null); // Placeholder; actual init in server.js or elsewhere
    return NextResponse.json(
      { message: "Socket.IO initialization triggered" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Socket.IO init error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to initialize Socket.IO" },
      { status: 500 }
    );
  }
}
