<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
// use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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

    // public function getJsonData(Request $request)
    // {
    //     // Only load the schema and put in session once
    //     if (!$request->session()->has('schema')) {
    //         $path = 'db_schema.json';

    //         if (Storage::exists($path)) {
    //             $jsonContent = Storage::get($path);
    //             $data = json_decode($jsonContent, true); // decode as associative array
    //             return response()->json($data);
    //         }

    //         return response()->json(['error' => 'File not found.'], 404);
    //     }

    // }

    public function send(Request $request)
    {   
        if (!$request->session()->has('schema')) {
            $path = 'db_schema.json';
    
            if (Storage::exists($path)) {
                $jsonContent = Storage::get($path);
                $schema = json_decode($jsonContent, true); // associative array
                $request->session()->put('schema', $schema);
            } else {
                return response()->json(['error' => 'Schema file not found.'], 404);
            }
        }

        $schema = $request->session()->get('schema', []);
        $schemaJson = json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        // Retrieve the existing conversation history from the session, or initialize it with a system prompt
        $messages = $request->session()->get('messages', [
            [
                'role' => 'system',
                'content' => 'You are a helpful assistant at querying postgres database.',
            ],
            [
                'role' => 'user',
                'content' => "Given the following database tables:\n\n$schemaJson",
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
        $url = env('MCP_BRIDGE_URL');
        $response = Http::post($url . '/v1/chat/completions', $payload);

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


