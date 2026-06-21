# -*- coding: utf-8 -*-
"""Cluster works directly in concept-fingerprint space (KMeans, k=5 to mirror the
five tradition labels), characterise each cluster by its dominant concepts, and
test how far these purely concept-driven clusters recover the hand-assigned
traditions (NMI / ARI / silhouette). Writes w.cl per work and cluster_meta into
stats.json. k=5 makes the recovery test apples-to-apples with the 5 traditions."""
import json, collections, numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import (normalized_mutual_info_score, adjusted_rand_score,
                             silhouette_score)

C = json.load(open('data/corpus.json', encoding='utf-8'))
keys = list(C[0]['concepts'].keys())
X = np.log1p(np.array([[w['concepts'].get(k, 0.0) for k in keys] for w in C], float))
mu = X.mean(0); sd = X.std(0); sd[sd == 0] = 1.0
Z = (X - mu) / sd

K = 5
km = KMeans(n_clusters=K, n_init=10, random_state=42).fit(Z)
lab = km.labels_

# relabel clusters by descending size for a stable colour palette
order = [c for c, _ in collections.Counter(lab).most_common()]
remap = {old: new for new, old in enumerate(order)}
lab = np.array([remap[l] for l in lab])

trad = [w['trad'] for w in C]
nmi  = normalized_mutual_info_score(trad, lab)
ari  = adjusted_rand_score(trad, lab)
sil  = silhouette_score(Z, lab)

top = {}
for c in range(K):
    idx = np.where(lab == c)[0]
    if len(idx) == 0:
        continue
    centroid = Z[idx].mean(0)
    top[c] = [keys[j] for j in np.argsort(centroid)[::-1][:4]]

for w, l in zip(C, lab):
    w['cl'] = int(l)
json.dump(C, open('data/corpus.json', 'w', encoding='utf-8'), ensure_ascii=False)

ST = json.load(open('data/stats.json', encoding='utf-8'))
for stale in ('comm', 'comm_meta'):
    ST.pop(stale, None)
ST['cluster_meta'] = {'k': K, 'nmi': round(float(nmi), 3), 'ari': round(float(ari), 3),
                      'sil': round(float(sil), 3),
                      'sizes': [int((lab == c).sum()) for c in range(K)], 'top': top}
json.dump(ST, open('data/stats.json', 'w', encoding='utf-8'), ensure_ascii=False)

print('KMeans k=%d  sizes=%s' % (K, ST['cluster_meta']['sizes']))
print('silhouette=%.3f   NMI(vs tradition)=%.3f   ARI=%.3f' % (sil, nmi, ari))
for c in range(K):
    print('  cluster %d  top:' % c, ', '.join(top.get(c, [])))
