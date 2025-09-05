# Intelligent Intrusion Detection System (IDS)

## Overview
This repository showcases an Intelligent Intrusion Detection System (IDS) developed using the CICIDS2017 dataset from the Canadian Institute for Cybersecurity (CIC). The project implements a machine learning-based approach for detecting network intrusions, featuring data preprocessing, binary and multi-class classification, and a structured pipeline. It highlights skills in AI model design, feature engineering, and system evaluation, with a focus on achieving high performance (e.g., up to 98.47% accuracy in binary classification).

## Features
- **Data Preprocessing**: Cleaning, label encoding, stratified data splitting, feature selection with XGBoost, and SMOTE for binary class imbalance.
- **Feature Engineering**: Combined feature importance, ratios, differences, and interactions to boost binary classification performance.
- **Classification Models**: Multi-Layer Perceptron (MLP) models with varying architectures for binary (benign vs. attack) and multi-class (8 attack types) tasks.
- **Evaluation**: Metrics including accuracy, precision, recall, F1-score, False Alarm Rate (FAR), and Anomaly Miss Rate (AMR).

## Architecture
The system follows a modular pipeline:
- **Data Collection**: Gathers network traffic from CICIDS2017.
- **Preprocessing**: Cleans and encodes data, selects features, and applies SMOTE for binary tasks.
- **Model Training**: Trains MLP models for binary (0/1) and multi-class (0 to 7) classification.
- **Detection**: Performs real-time anomaly detection and generates reports.

See the full system & data preprocessing workflow:

![System Pipeline](images/sys_pipeline.png)
![Feature engineering](images/feature_engineering.png)

## Interface Overview
The system includes a planned web-based interface for user interaction:

- **Dashboard**: Displays detection results and class distributions (e.g., benign vs. attack types).
- **File Upload**: Allows users to upload CSV files (e.g., CICIDS2017) for analysis.
- **Visualization**: Presents data insights, such as the class distribution below, to aid decision-making.


![interface overview](images/1.png)
![interface overview](images/2.png)
![interface overview](images/3.png)
![interface overview](images/4.png)


## Project Structure
- `AI/`: 
  - `notebooks/`: Jupyter notebooks for preprocessing and training.
  - `models/`: Model configurations and placeholders.
- `backend/firewall/`: 
  - `app.py`: Pseudo-code for backend logic.
  - `analyze.py`: Analysis scripts.
  - `detection.py`: Detect intrusion.
  - `requirements.txt`: Backend dependencies.
- `frontend/firewall/`: 
  - `src/`: UI component placeholders.
- `.gitignore`: Excludes temporary files.
- `requirements.txt`: Project dependencies.

## Technologies Used
- **AI/ML**: Python, Jupyter, Pandas, Scikit-learn, Keras, XGBoost, TensorFlow, Smote.
- **Backend**: Flask (simulated).
- **Frontend**: Next.js (simulated).

## Installation and Setup
1. Clone the repository: `git clone https://github.com/aychachouchene/Intelligent_IDS.git`.
2. Install dependencies: Run `pip install -r requirements.txt`.
3. Simulate the workflow: Use `ai/notebooks/preprocessing&training.ipynb` to follow the pipeline.
4. Explore UI/Backend: Refer to pseudo-code in `backend/` and `frontend/` for intended functionality.

## Usage
- Run the Jupyter notebook to preprocess CICIDS2017 data and train models.
- Simulate detection by reviewing the pipeline output in the notebook.
- Visualize results using the data preprocessing workflow:

## Skills Demonstrated
- **AI/ML**: Data cleaning, feature engineering, model training/evaluation, handling class imbalance.
- **System Design**: Modular pipeline development and performance optimization.
- **Documentation**: Clear workflow and structure explanation.

## Contributing
All Feedbacks are welcomed .

## Acknowledgments
Utilizes the CICIDS2017 dataset from the Canadian Institute for Cybersecurity.