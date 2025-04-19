
<div class="topbar d-flex align-items-center justify-content-between">
    <div class="d-flex align-items-center">
      <button class="btn btn-sm btn-outline-secondary d-lg-none me-2"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasSidebar"
            aria-controls="offcanvasSidebar">
    <i class="bi bi-list fs-4"></i>
    </button>

    <span class="fw-bold d-inline d-lg-none">ADB-Web</span>
    </div>
    <div class="mx-auto d-none d-md-block" style="max-width: 400px; width: 100%;">
        <div class="d-flex gap-2">
          <div class="input-group input-group-sm">
            <input type="text" id="searchInput" class="form-control" placeholder="Search something...">
            <button id="searchBtn" class="btn btn-outline-secondary" type="button">
              <i class="bi bi-search"></i>
            </button>
          </div>
          <button class="btn btn-outline-primary btn-sm" type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#aiChatOffcanvas"
                aria-controls="aiChatOffcanvas"
                title="AI Assistant">
        <i class="bi bi-robot"></i>
        </button>
        
        <div class="offcanvas offcanvas-end text-bg-light border-0"
        tabindex="-1"
        id="aiChatOffcanvas"
        aria-labelledby="aiChatOffcanvasLabel"
        style="width: 320px; background-color: rgba(255, 255, 255, 0.95); box-shadow: 0 0 10px rgba(0,0,0,0.1);">
   
        <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="aiChatOffcanvasLabel">AI Assistant</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
    
        <div class="offcanvas-body d-flex flex-column">
            <div id="chatMessages" class="chat-messages mb-3" style="max-height: 300px; overflow-y: auto;"></div>

            <p id="chatWelcome" class="text-muted">How can I help you today?</p>
            <!-- You can dynamically add messages here -->
        </div>
        
        <div class="offcanvas-body d-flex flex-column justify-content-between">

            <div id="chatMessages" class="chat-messages mb-3" style="max-height: 60vh; overflow-y: auto;"></div>
          
            <form id="chatForm" class="mt-3">
              <div class="input-group input-group-lg">
                <input type="text" class="form-control" id="chatInput" placeholder="Type your message..." />
                <button type="submit" id="chatSendBtn" class="btn btn-primary">
                  <i class="bi bi-send"></i>
                </button>
              </div>
            </form>
          
          </div>
        </div>
    </div>
            {{-- <div class="modal fade" id="aiChatModal" tabindex="-1" aria-labelledby="aiChatModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" style="max-width: 400px;">
                  <div class="modal-content border-0 shadow rounded-4"
                       style="background-color: rgba(255, 255, 255, 0.9); backdrop-filter: blur(6px);">
                    <div class="modal-header border-0">
                      <h5 class="modal-title" id="aiChatModalLabel">💬 AI Chat</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <p class="text-muted">How can I help you today?</p>
                      <!-- Example Chat UI -->
                      <div class="mb-2">
                        <input type="text" class="form-control form-control-sm" placeholder="Type your question...">
                      </div>
                      <button class="btn btn-primary btn-sm w-100">Send</button>
                    </div>
                  </div>
                </div>
              </div>
               --}}
        </div>
      </div>
      <div class="d-flex align-items-center gap-2 ms-3">
        <a href="/neo4j" class="btn btn-outline-success btn-sm" title="Switch to Neo4j View">
          <i class="bi bi-diagram-3"></i> Neo4j
        </a>
      </div>
  </div>
  