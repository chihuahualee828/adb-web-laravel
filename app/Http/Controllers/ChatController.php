<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
// use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    // public function index()
    // {
    //     return view('chat');
    // }
    // public function index(Request $request)
    // {
    //     // Clear the conversation history from the session
    //     $request->session()->forget('messages');

    //     return view('chat');
    // }

    public function send(Request $request)
    {
        // Retrieve the existing conversation history from the session, or initialize it with a system prompt
        $messages = $request->session()->get('messages', [
            [
                'role' => 'system',
                'content' => 'You are a helpful assistant at querying postgres database.',
            ],
        ]);

        // Append the user's new message to the conversation history
        $messages[] = [
            'role' => 'user',
            'content' => $request->input('message'),
        ];

        // Prepare the payload for the API request
        $payload = [
            'model' => 'gpt-4o-mini',
            'messages' => $messages,
            'stream' => false, // Set to true if you want to stream responses
        ];
        // Log::info('User message:', ['content' => $messages]);

        // Send the request to the MCP-Bridge server
        $response = Http::post('http://172.21.192.1:9090/v1/chat/completions', $payload);

        // Decode the JSON response
        $result = $response->json();

        // Extract the assistant's reply from the response
        $reply = $result['choices'][0]['message']['content'] ?? 'No response from AI.';

        // Append the assistant's reply to the conversation history
        $messages[] = [
            'role' => 'assistant',
            'content' => $reply,
        ];

        // Store the updated conversation history back into the session
        $request->session()->put('messages', $messages);

        // Return the assistant's reply as a JSON response
        return response()->json([
            'reply' => $reply,
        ]);
    }

    // public function reset(Request $request)
    // {
    //     // Clear the conversation history from the session
    //     $request->session()->forget('messages');

    //     // Optionally, redirect back to the chat view or return a response
    //     return redirect()->route('chat.index');
    // }
}
