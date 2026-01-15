import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

import numpy as np
import ssl

# Bypass SSL verification for dataset loading
ssl._create_default_https_context = ssl._create_unverified_context

# Set style
sns.set_theme(style="whitegrid")

# Load datasets
tips = sns.load_dataset("tips")
iris = sns.load_dataset("iris")

def save_plot(filename):
    plt.tight_layout()
    plt.savefig(f"public/images/seaborn/{filename}", dpi=100, bbox_inches='tight')
    plt.close()

# 1. Relational - Scatterplot
plt.figure(figsize=(5, 4))
sns.scatterplot(data=tips, x="total_bill", y="tip", hue="smoker", style="time", s=100)
plt.title("Scatterplot: Bill vs Tip")
save_plot("scatterplot.png")

# 2. Relational - Lineplot
# Create dummy time series data
dates = pd.date_range("2023-01-01", periods=100)
data = pd.DataFrame({
    "date": dates,
    "value": np.cumsum(np.random.randn(100)),
    "category": ["A"]*50 + ["B"]*50
})
plt.figure(figsize=(5, 4))
sns.lineplot(data=data, x="date", y="value")
plt.title("Lineplot: Time Series")
plt.xticks(rotation=45)
save_plot("lineplot.png")

# 3. Distribution - Histplot
plt.figure(figsize=(5, 4))
sns.histplot(data=tips, x="total_bill", hue="time", multiple="stack")
plt.title("Histplot: Total Bill Distribution")
save_plot("histplot.png")

# 4. Distribution - Kdeplot
plt.figure(figsize=(5, 4))
sns.kdeplot(data=tips, x="total_bill", hue="time", fill=True, alpha=.5)
plt.title("KDE Plot: Density Estimate")
save_plot("kdeplot.png")

# 5. Categorical - Boxplot
plt.figure(figsize=(5, 4))
sns.boxplot(data=tips, x="day", y="total_bill", hue="smoker")
plt.title("Boxplot: Bill by Day")
save_plot("boxplot.png")

# 6. Categorical - Violinplot
plt.figure(figsize=(5, 4))
sns.violinplot(data=tips, x="day", y="total_bill", hue="smoker", split=True, inner="quart")
plt.title("Violinplot: Distribution Shape")
save_plot("violinplot.png")

# 7. Categorical - Barplot
plt.figure(figsize=(5, 4))
sns.barplot(data=tips, x="day", y="total_bill", hue="sex")
plt.title("Barplot: Mean Bill with CI")
save_plot("barplot.png")

# 8. Heatmap
plt.figure(figsize=(5, 4))
corr = tips[['total_bill', 'tip', 'size']].corr()
sns.heatmap(corr, annot=True, cmap="coolwarm", center=0)
plt.title("Correlation Heatmap")
save_plot("heatmap.png")

# 9. ECDF Plot
plt.figure(figsize=(5, 4))
sns.ecdfplot(data=tips, x="total_bill", hue="time")
plt.title("ECDF: Bill Distribution")
save_plot("ecdfplot.png")

# 10. Strip Plot
plt.figure(figsize=(5, 4))
sns.stripplot(data=tips, x="day", y="total_bill", hue="smoker", dodge=True, jitter=True)
plt.title("Stripplot: Individual Observations")
save_plot("stripplot.png")

# 11. Swarm Plot
plt.figure(figsize=(5, 4))
sns.swarmplot(data=tips.head(100), x="day", y="total_bill", hue="sex", dodge=True)
plt.title("Swarmplot: Beeswarm Distribution")
save_plot("swarmplot.png")

# 12. Point Plot
plt.figure(figsize=(5, 4))
sns.pointplot(data=tips, x="day", y="total_bill", hue="smoker", dodge=True)
plt.title("Pointplot: Mean & Error Bars")
save_plot("pointplot.png")

# 13. Pair Plot
# pairplot is a figure-level function that creates its own figure
g = sns.pairplot(iris, hue="species", height=2)
g.fig.suptitle("Pairplot: Iris Dataset", y=1.02)
save_plot("pairplot.png")

# 14. Joint Plot
# jointplot is figure-level
g = sns.jointplot(data=tips, x="total_bill", y="tip", hue="smoker", height=5)
g.fig.suptitle("Jointplot: Bivariate & Marginals", y=1.02)
save_plot("jointplot.png")

# 15. Regression Plot (lmplot)
# lmplot is figure-level
g = sns.lmplot(data=tips, x="total_bill", y="tip", hue="smoker", height=5)
g.fig.suptitle("Lmplot: Regression Lines", y=1.02)
save_plot("lmplot.png")

# 16. Displot
# displot is figure-level
g = sns.displot(data=tips, x="total_bill", kind="kde", hue="time", col="time")
g.fig.suptitle("Displot: Distribution by Time", y=1.02)
save_plot("displot.png")

# 17. Countplot
plt.figure(figsize=(5, 4))
sns.countplot(data=tips, x="day", hue="smoker")
plt.title("Countplot: Counts by Day & Smoker")
save_plot("countplot.png")

# 18. Catplot
# catplot is figure-level
g = sns.catplot(data=tips, x="day", y="total_bill", hue="smoker", kind="box", col="time", height=4, aspect=.7)
g.fig.suptitle("Catplot: Boxplots by Time", y=1.02)
save_plot("catplot.png")

print("All images generated.")
