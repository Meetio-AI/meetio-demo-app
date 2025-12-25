"""Minimal FastAPI backend for Meetio test environment."""
import sentry_sdk

sentry_sdk.init(
    dsn="https://v7AycP4c4cJagWL3quiS@sonarly.dev/160",
    traces_sample_rate=1.0,
    environment="production",
)

# Instant detection - sends ping when server starts
sentry_sdk.capture_message("sonarly-backend-installed", "info")

import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Meetio Test Backend")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CartItem(BaseModel):
    product: str
    price: float


class PaymentRequest(BaseModel):
    amount: float
    card: str


# ============ SUCCESS ENDPOINTS ============

@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/cart")
async def add_to_cart(item: CartItem):
    # Simulate slight delay
    await asyncio.sleep(0.3)
    return {"success": True, "message": f"Added {item.product} to cart"}


@app.post("/api/payment")
async def process_payment(payment: PaymentRequest):
    await asyncio.sleep(1)  # Simulate processing

    # Card number ending in 0002 = decline
    if payment.card.endswith("0002"):
        raise HTTPException(status_code=402, detail="Card declined: Insufficient funds")

    # Card number ending in 0003 = network error simulation (timeout)
    if payment.card.endswith("0003"):
        await asyncio.sleep(10)  # Will likely timeout
        raise HTTPException(status_code=500, detail="Gateway timeout")

    return {"success": True, "order_id": "12345"}


# ============ ERROR ENDPOINTS ============

@app.get("/api/fail/400")
async def fail_400():
    raise HTTPException(status_code=400, detail="Bad request: Missing required field")


@app.get("/api/fail/404")
async def fail_404():
    raise HTTPException(status_code=404, detail="Resource not found")


@app.get("/api/fail/500")
async def fail_500():
    raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/fail/network")
async def fail_network():
    # Simulate network failure by hanging then erroring
    await asyncio.sleep(5)
    raise HTTPException(status_code=503, detail="Service unavailable")


# ============ SPECIAL ENDPOINTS ============

@app.get("/api/slow")
async def slow_endpoint(delay: int = 3):
    """Responds after {delay} seconds."""
    await asyncio.sleep(min(delay, 10))  # Cap at 10s
    return {"success": True, "delayed_by": delay}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
