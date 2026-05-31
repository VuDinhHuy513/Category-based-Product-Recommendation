from recommender import recommend_similar

result = recommend_similar(
    product_id="B002PD61Y4",
    use_category=True,
    top_k=5
)

print("Sản phẩm đầu vào:")
print(result["source_product"]["product_name"])
print("\nTop gợi ý:")

for i, item in enumerate(result["recommendations"], start=1):
    print(f"{i}. {item['product_name']} | score={item['similarity_score']:.4f}")