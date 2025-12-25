from flask import Flask, render_template

app = Flask(__name__)


# Hlavní stránka s produkty
@app.route("/")
def index():
    return render_template("index.html")

# Stránka s produkty (vsechny)
@app.route("/shopping")
def shopping():
    return render_template("shopping.html")

# Stránka s detailem produktu
@app.route("/product1")
def product1():
    return render_template("Product1.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
