# -*- coding: utf-8 -*-
"""Enrich corpus.json with a 2-D PCA projection of each work's 29-dim concept
fingerprint, and record the axis interpretation (dominant concept loadings) and
explained variance in stats.json. Densities are log1p-transformed and z-scored
so a few very frequent terms (e.g. tefsir) do not dominate the geometry."""
import json, numpy as np

C = json.load(open('data/corpus.json', encoding='utf-8'))
keys = list(C[0]['concepts'].keys())

X  = np.array([[w['concepts'].get(k, 0.0) for k in keys] for w in C], float)
Xl = np.log1p(X)
mu = Xl.mean(0); sd = Xl.std(0); sd[sd == 0] = 1.0
Z  = (Xl - mu) / sd
Zc = Z - Z.mean(0)

U, S, Vt = np.linalg.svd(Zc, full_matrices=False)
var   = S**2
ratio = var / var.sum()
scores = U[:, :2] * S[:2]
comps  = Vt[:2].copy()                      # 2 x 29 loadings

# deterministic sign (largest-magnitude loading positive) -> stable reruns
for i in range(2):
    j = int(np.argmax(np.abs(comps[i])))
    if comps[i, j] < 0:
        comps[i] = -comps[i]; scores[:, i] = -scores[:, i]

for w, (x, y) in zip(C, scores):
    w['px'] = round(float(x), 3)
    w['py'] = round(float(y), 3)
json.dump(C, open('data/corpus.json', 'w', encoding='utf-8'), ensure_ascii=False)

def axinfo(comp):
    order = np.argsort(comp)
    neg = [[keys[j], round(float(comp[j]), 3)] for j in order[:5]]
    pos = [[keys[j], round(float(comp[j]), 3)] for j in order[::-1][:5]]
    return {'pos': pos, 'neg': neg}

ST = json.load(open('data/stats.json', encoding='utf-8'))
ST['pca'] = {'var': [round(float(ratio[0]), 3), round(float(ratio[1]), 3)],
             'ax1': axinfo(comps[0]), 'ax2': axinfo(comps[1])}
json.dump(ST, open('data/stats.json', 'w', encoding='utf-8'), ensure_ascii=False)

print('PCA explained variance  PC1=%.1f%%  PC2=%.1f%%  (sum %.1f%%)'
      % (ratio[0]*100, ratio[1]*100, (ratio[0]+ratio[1])*100))
print('PC1  + :', ', '.join(k for k, _ in ST['pca']['ax1']['pos']))
print('PC1  - :', ', '.join(k for k, _ in ST['pca']['ax1']['neg']))
print('PC2  + :', ', '.join(k for k, _ in ST['pca']['ax2']['pos']))
print('PC2  - :', ', '.join(k for k, _ in ST['pca']['ax2']['neg']))
