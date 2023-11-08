use axum::{
    extract::{
        ws::{Message, WebSocket},
        WebSocketUpgrade,
    },
    response::IntoResponse,
    routing::{get, Router},
    Json,
};

///
/// This fn is used to register the routes for the backend.
///
pub fn register(app: Router) -> Router {
    app.route("/ws", get(ws_handler)).route("/", get(handler))
}

async fn handler() -> impl IntoResponse {
    "Hello, from backend!"
}

async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    loop {
        if let Some(msg) = socket.recv().await {
            if let Ok(msg) = msg {
                match msg {
                    Message::Text(t) => {
                        // Echo
                        if socket
                            .send(Message::Text(format!("Echo from backend: {}", t)))
                            .await
                            .is_err()
                        {
                            return;
                        }
                    }
                    Message::Close(_) => {
                        return;
                    }
                    _ => {}
                }
            } else {
                return;
            }
        }
    }
}
