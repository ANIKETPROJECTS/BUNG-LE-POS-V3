from pathlib import Path
import fitz

source = Path("attached_assets/Restaurant_Menu_1789908664055.pdf")
output = Path(".agents/outputs/menu_pdf")
output.mkdir(parents=True, exist_ok=True)

doc = fitz.open(source)
print(f"pages={len(doc)}")

for index, page in enumerate(doc, start=1):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    image_path = output / f"page-{index:02d}.png"
    pixmap.save(image_path)
    text = page.get_text("text").strip()
    print(f"page={index} size={page.rect.width:.1f}x{page.rect.height:.1f} text_chars={len(text)} image={image_path}")