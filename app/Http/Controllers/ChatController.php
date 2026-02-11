<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
// use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller
{

    public function send(Request $request)
    {   
        if (!$request->session()->has('schema')) {
            $path = 'db_schema.json';
    
            if (Storage::exists($path)) {
                $jsonContent = Storage::get($path);
                $schema = json_decode($jsonContent, true); // associative array
                $request->session()->put('schema', $schema);
                Log::info('Loaded schema', ['schema' => $schema]);
            } else {
                return response()->json(['error' => 'Schema file not found.'], 404);
            }
        }

        if (!$request->session()->has('db_prompt')) {
            $promptPath = 'prompt.txt';

            if (Storage::exists($promptPath)) {
                $dbPrompt = Storage::get($promptPath);
                $request->session()->put('db_prompt', $dbPrompt);
                Log::info('Loaded DB prompt');
            } else {
                return response()->json(['error' => 'Prompt file not found.'], 404);
            }
        }
        $dbPrompt = $request->session()->get('db_prompt', '');
        

        $schema = $request->session()->get('schema', []);
        $schemaJson = json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        // Retrieve the existing conversation history from the session, or initialize it with a system prompt
        $messages = $request->session()->get('messages', [
            [
                'role' => 'system',
                'content' => 'You are a helpful assistant at querying postgres database. \n\n' . $dbPrompt,
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
            'model' => env('MCP_MODEL'),
            'messages' => $messages,
            'stream' => false, // Set to true if you want to stream responses
        ];
        // Log::info('User message:', ['content' => $messages]);

        // Send the request to the MCP-Bridge server
        $url = env('MCP_BRIDGE_URL');
        // $response = Http::post($url . '/v1/chat/completions', $payload);

        // // Decode the JSON response
        // $result = $response->json();

        // // Extract the assistant's reply from the response
        // $reply = $result['choices'][0]['message']['content'] ?? 'No response from AI.';

        $endpoint = rtrim(env('MCP_BRIDGE_URL'), '/') . '/v1/chat/completions';

        $response = Http::timeout(120)          // long tool calls
            ->connectTimeout(10)
            ->retry(2, 500)                     // optional
            ->post($endpoint, $payload);

        if (!$response->successful()) {
            Log::error('MCP-Bridge error', [
                'status' => $response->status(),
                'body'   => substr($response->body(), 0, 4000),
            ]);

            return response()->json([
                'error' => 'Upstream error',
                'status' => $response->status(),
                'details' => $response->json() ?? $response->body(),
            ], 502);
        }

        $result = $response->json();

        $reply = data_get($result, 'choices.0.message.content', 'No response from AI.');



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


