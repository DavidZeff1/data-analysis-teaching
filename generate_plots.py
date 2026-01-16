import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os
import ssl

# Bypass SSL verification for dataset loading
ssl._create_default_https_context = ssl._create_unverified_context

# Ensure the public/images/python directory exists
output_dir = "public/images/python"
os.makedirs(output_dir, exist_ok=True)

def save_plot(filename):
    path = os.path.join(output_dir, filename)
    plt.savefig(path, bbox_inches='tight')
    plt.clf()
    plt.close('all')
    print(f"Saved {path}")

sns.set_theme(style="whitegrid")

# Load Datasets
# We will use penguins for everything to be consistent
penguins = sns.load_dataset("penguins")

# ==========================================
# 1. Relational Plots (relplot)
# ==========================================

# 1. Scatterplot
# Uses relplot(kind="scatter")
# Facet by island
g = sns.relplot(
    data=penguins,
    x="bill_length_mm",
    y="bill_depth_mm",
    hue="species",
    style="species",
    kind="scatter",
    col="island",
    height=4
)
g.fig.suptitle("Relational Plot (Scatter): Bill Dimensions by Island", y=1.05)
save_plot("scatterplot.png")

# 2. Lineplot
# Uses relplot(kind="line")
g = sns.relplot(
    data=penguins,
    x="bill_length_mm",
    y="flipper_length_mm",
    hue="species",
    kind="line",
    col="sex",
    height=4
)
g.fig.suptitle("Relational Plot (Line): Flipper vs Bill Length by Sex", y=1.05)
save_plot("lineplot.png")


# ==========================================
# 2. Distribution Plots (displot)
# ==========================================

# 3. Histplot
# Uses displot(kind="hist")
g = sns.displot(
    data=penguins,
    x="flipper_length_mm",
    hue="species",
    kind="hist",
    col="sex",
    multiple="stack",
    height=4
)
g.fig.suptitle("Displot (Hist): Flipper Length Distribution by Sex", y=1.05)
save_plot("histplot.png")

# 4. Kdeplot
# Uses displot(kind="kde")
g = sns.displot(
    data=penguins,
    x="body_mass_g",
    hue="species",
    kind="kde",
    fill=True,
    col="island",
    height=4
)
g.fig.suptitle("Displot (KDE): Body Mass Density by Island", y=1.05)
save_plot("kdeplot.png")

# 5. Ecdfplot
# Uses displot(kind="ecdf")
g = sns.displot(
    data=penguins,
    x="flipper_length_mm",
    hue="species",
    kind="ecdf",
    col="sex",
    height=4
)
g.fig.suptitle("Displot (ECDF): Flipper Length Cumulative Dist.", y=1.05)
save_plot("ecdfplot.png")

# ==========================================
# 3. Categorical Plots (catplot)
# ==========================================

# 6. Stripplot
# Uses catplot(kind="strip")
g = sns.catplot(
    data=penguins,
    x="species",
    y="body_mass_g",
    hue="sex",
    kind="strip",
    col="island",
    jitter=True,
    height=4
)
g.fig.suptitle("Catplot (Strip): Body Mass by Species & Island", y=1.05)
save_plot("stripplot.png")

# 7. Swarmplot
# Uses catplot(kind="swarm")
g = sns.catplot(
    data=penguins,
    x="species",
    y="bill_depth_mm",
    hue="sex",
    kind="swarm",
    col="island",
    height=4
)
g.fig.suptitle("Catplot (Swarm): Bill Depth by Species & Island", y=1.05)
save_plot("swarmplot.png")

# 8. Boxplot
# Uses catplot(kind="box")
g = sns.catplot(
    data=penguins,
    x="species",
    y="bill_length_mm",
    hue="sex",
    kind="box",
    col="island",
    height=4
)
g.fig.suptitle("Catplot (Box): Bill Length by Species & Island", y=1.05)
save_plot("boxplot.png")

# 9. Violinplot
# Uses catplot(kind="violin")
g = sns.catplot(
    data=penguins,
    x="species",
    y="flipper_length_mm",
    hue="sex",
    kind="violin",
    split=True,
    col="island",
    height=4
)
g.fig.suptitle("Catplot (Violin): Flipper Length by Species & Island", y=1.05)
save_plot("violinplot.png")

# 10. Barplot
# Uses catplot(kind="bar")
g = sns.catplot(
    data=penguins,
    x="species",
    y="body_mass_g",
    hue="sex",
    kind="bar",
    col="island",
    height=4
)
g.fig.suptitle("Catplot (Bar): Avg Body Mass by Species & Island", y=1.05)
save_plot("barplot.png")

# 11. Pointplot
# Uses catplot(kind="point")
g = sns.catplot(
    data=penguins,
    x="species",
    y="body_mass_g",
    hue="sex",
    kind="point",
    col="island",
    markers=["^", "o"],
    linestyles=["-", "--"],
    height=4
)
g.fig.suptitle("Catplot (Point): Avg Body Mass Trends by Island", y=1.05)
save_plot("pointplot.png")

# 12. Countplot
# Uses catplot(kind="count")
g = sns.catplot(
    data=penguins,
    x="species",
    hue="sex",
    kind="count",
    col="island",
    height=4
)
g.fig.suptitle("Catplot (Count): Species Counts by Island", y=1.05)
save_plot("countplot.png")

# 13. Generic Displot Example (for displot.png)
g = sns.displot(
    data=penguins,
    x="flipper_length_mm",
    kind="kde",
    hue="species",
    col="island",
    fill=True,
    height=4
)
g.fig.suptitle("Displot: Flipper Length KDE by Island", y=1.05)
save_plot("displot.png")

# 14. Generic Catplot Example (for catplot.png)
g = sns.catplot(
    data=penguins,
    x="species",
    y="body_mass_g",
    hue="sex",
    kind="box",
    col="island",
    height=4
)
g.fig.suptitle("Catplot: Body Mass Boxplots by Island", y=1.05)
save_plot("catplot.png")

print("All images generated.")
