use std::net::SocketAddr;

use axum::{http::Method, Router};
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

mod router;

pub async fn start(port: u16) {
    let app = router::register(Router::new()).layer(
        CorsLayer::new().allow_origin(Any).allow_methods(vec![
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
        ]),
    );

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    info!("Backend is listening on http://{}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
