from fastapi import APIRouter
import requests

from app.config import GNEWS_API_KEY

router = APIRouter()


@router.get("/")
async def get_news():

    try:

        url = (
            f"https://gnews.io/api/v4/search?"
            f"q=india&lang=en&country=in&max=10&apikey={GNEWS_API_KEY}"
        )

        response = requests.get(url)

        data = response.json()

        articles = data.get("articles", [])

        formatted_news = []

        for article in articles:

            formatted_news.append({
                "title": article.get("title"),
                "description": article.get("description"),
                "url": article.get("url"),
                "image": article.get("image"),
                "publishedAt": article.get("publishedAt"),
                "source": article.get("source", {}).get("name")
            })

        return {
            "status": "success",
            "total": len(formatted_news),
            "news": formatted_news
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }