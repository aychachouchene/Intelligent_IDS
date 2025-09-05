# Model Architectures and Evaluation

## Overview
This directory contains the architectures and evaluation details for the Intelligent Intrusion Detection System (IDS) models trained on the CICIDS2017 dataset. The models include 5 binary classification variants (benign vs. attack) and 5 multi-class classification variants (8 attack types), with performance insights from evaluation curves.

## Binary Classification Models
- **Model 1**: Simple MLP - 8-4-2 neurons, ReLU activation, single hidden layer.
- **Model 2**: Moderate MLP - 16-8-4-2 neurons, ReLU activation, two hidden layers.
- **Model 3**: Complex MLP - 32-16-8-4-2 neurons, ReLU activation, three hidden layers.
- **Model 4**: Deep MLP - 64-32-16-8-2 neurons, ReLU activation, four hidden layers.
- **Model 5**: Optimized MLP - 128-64-32-16-2 neurons, ReLU activation, dropout (0.2), four hidden layers.

See the simplest binary architecture:
<img src="../../images/modele_1_b.png" alt="Binary Model 1 Architecture">

## Multi-Class Classification Models
- **Model 1**: Basic MLP - 16-8-8 neurons, softmax output, single hidden layer.
- **Model 2**: Enhanced MLP - 32-16-8-8 neurons, softmax output, two hidden layers.
- **Model 3**: Detailed MLP - 64-32-16-8-8 neurons, softmax output, three hidden layers.
- **Model 4**: Advanced MLP - 128-64-32-16-8 neurons, softmax output, four hidden layers.
- **Model 5**: Refined MLP - 256-128-64-32-8 neurons, softmax output, dropout (0.3), four hidden layers.

See the most complex multi-class architecture:
<img src="../../images/modele_5_m.png" alt="Multi-Class Model 5 Architecture" >

## Evaluation Curves
- **Binary Models**: Learning curves showing accuracy and loss over epochs.
  - ![Binary Model 1 Curve](../../images/eval_1_b.png)
  - ![Binary Model 5 Curve](../../images/eval_5_b.png)
- **Multi-Class Models**: Learning curves displaying accuracy and loss trends.
  - ![Multi-Class Model 1 Curve](../../images/eval_1_m.png)
  - ![Multi-Class Model 5 Curve](../../images/eval_5_m.png)

## Performance Notes
- Binary models achieve up to 98.47% accuracy with optimized architectures.
- Multi-class models show balanced performance across 8 classes, with precision and recall varying by attack type.
- Curves indicate training stability, with dropout reducing overfitting in complex models.