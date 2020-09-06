'use strict'

const Promise = require('bluebird')
const _ = require('lodash')
const mongoose = require('mongoose')
const appDB = require('../src/db')

/* eslint-disable max-len, object-curly-newline, object-property-newline */
const conditions = [
  { type: 'condition', typeLabel: 'Condition', label: 'Lung Cancer', name: 'lung_cancer', parents: [] },
  { type: 'condition', typeLabel: 'Condition', label: 'Breast Cancer', name: 'breast_cancer', parents: [] },
  { type: 'condition', typeLabel: 'Condition', label: 'Prostate Cancer', name: 'prostate_cancer', parents: [] },
  { type: 'condition', typeLabel: 'Condition', label: 'Colorectal Cancer', name: 'colorectal_cancer', parents: [] }
]

const biomarkers = [
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'RAS', name: 'ras_biomarker', parents: [] },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'BRAF', name: 'braf_biomarker', parents: ['lung_cancer'] },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'PICK3CA', name: 'pick3ca_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'EGFR', name: 'egfr_biomarker', parents: ['lung_cancer'] },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'KRAS', name: 'kras_biomarker' },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'ALK', name: 'alk_biomarker', parents: ['lung_cancer'] },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'ROS1', name: 'ros1_biomarker', parents: ['lung_cancer'] },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'Other', name: 'other_biomarker', parents: ['lung_cancer'] },
  { type: 'biomarker', typeLabel: 'Biomarker', label: 'Unknown', name: 'unknown_biomarker', parents: ['lung_Cancer'] }
]

const biomarkerSubtypes = [
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'Exon 19', name: 'exon_19_biomarker_subtype',
    parents: ['egfr_biomarker'] },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'Exon 20', name: 'exon_20_biomarker_subtype',
    parents: ['egfr_biomarker'] },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'Exon 21(L858R)', name: 'exon_21_biomarker_subtype',
    parents: ['egfr_biomarker'] },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'Exon 18', name: 'exon_18_biomarker_subtype',
    parents: ['egfr_biomarker'] },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'CD74', name: 'cd74_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'SLC34A2', name: 'slc34a2_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'GOPC', name: 'gopc_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'CCDC6', name: 'ccdc6_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'SDC4', name: 'sdc4_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'TPM3', name: 'tpm3_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'EZR', name: 'ezr_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'LRIG3', name: 'lrig3_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'KDELR2', name: 'kdelr2_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'LIMA1', name: 'lima1_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'MSN', name: 'msn_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'CLTC', name: 'cltc_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'TPD52L1', name: 'tpd52l1_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'TMEM106B', name: 'tmem106b_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'FAM135B', name: 'fam135b_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'SLC6A17', name: 'slc6a17_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'ELM4', name: 'elm4_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'HIP4', name: 'hip4_biomarker_subtype' },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'Other', name: 'other_biomarker_subtype',
    parents: ['egfr_biomarker'] },
  { type: 'biomarker_subtype', typeLabel: 'Biomarker sub type', label: 'Unknown', name: 'unknown_biomarker_subtype',
    parents: ['egfr_biomarker'] }
]

const firstGenMutation = [
  { type: 'first_gen_mutation', typeLabel: 'First gen mutation', label: 'T790M+', name: 't790m+_first_gen_mutation',
    parents: ['exon_21_biomarker_subtype', 'exon_20_biomarker_subtype', 'exon_19_biomarker_subtype', 'exon_18_biomarker_subtype'] },
  { type: 'first_gen_mutation', typeLabel: 'First gen mutation', label: 'T790M-', name: 't790m-_first_gen_mutation',
    parents: ['exon_21_biomarker_subtype', 'exon_20_biomarker_subtype', 'exon_19_biomarker_subtype', 'exon_18_biomarker_subtype'] },
  { type: 'first_gen_mutation', typeLabel: 'First gen mutation', label: 'Other', name: 'other_first_gen_mutation',
    parents: ['exon_21_biomarker_subtype', 'exon_20_biomarker_subtype', 'exon_19_biomarker_subtype', 'exon_18_biomarker_subtype'] },
  { type: 'first_gen_mutation', typeLabel: 'First gen mutation', label: 'Unknown', name: 'unknown_first_gen_mutation',
    parents: ['exon_21_biomarker_subtype', 'exon_20_biomarker_subtype', 'exon_19_biomarker_subtype', 'exon_18_biomarker_subtype'] }
]

const secondGenMutation = [
  { type: 'second_gen_mutation', typeLabel: 'Second gen mutation', label: 'C797S', name: 'c797s_second_gen_mutation',
    parents: ['t790m+_first_gen_mutation', 't790m-_first_gen_mutation', 'other_first_gen_mutation', 'unknown_first_gen_mutation'] },
  { type: 'second_gen_mutation', typeLabel: 'Second gen mutation', label: 'MET', name: 'met_second_gen_mutation',
    parents: ['t790m+_first_gen_mutation', 't790m-_first_gen_mutation', 'other_first_gen_mutation', 'unknown_first_gen_mutation'] },
  { type: 'second_gen_mutation', typeLabel: 'Second gen mutation', label: 'HER2', name: 'her2_second_gen_mutation',
    parents: ['t790m+_first_gen_mutation', 't790m-_first_gen_mutation', 'other_first_gen_mutation', 'unknown_first_gen_mutation'] },
  { type: 'second_gen_mutation', typeLabel: 'Second gen mutation', label: 'BRAF', name: 'braf_second_gen_mutation',
    parents: ['t790m+_first_gen_mutation', 't790m-_first_gen_mutation', 'other_first_gen_mutation', 'unknown_first_gen_mutation'] },
  { type: 'second_gen_mutation', typeLabel: 'Second gen mutation', label: 'PIK3CA', name: 'pik3ca_second_gen_mutation',
    parents: ['t790m+_first_gen_mutation', 't790m-_first_gen_mutation', 'other_first_gen_mutation', 'unknown_first_gen_mutation'] },
  { type: 'second_gen_mutation', typeLabel: 'Second gen mutation', label: 'SCLC', name: 'sclc_second_gen_mutation',
    parents: ['t790m+_first_gen_mutation', 't790m-_first_gen_mutation', 'other_first_gen_mutation', 'unknown_first_gen_mutation'] },
  { type: 'second_gen_mutation', typeLabel: 'Second gen mutation', label: 'Other', name: 'other_second_gen_mutation',
    parents: ['t790m+_first_gen_mutation', 't790m-_first_gen_mutation', 'other_first_gen_mutation', 'unknown_first_gen_mutation'] },
  { type: 'second_gen_mutation', typeLabel: 'Second gen mutation', label: 'Unknown', name: 'unknown_second_gen_mutation',
    parents: ['t790m+_first_gen_mutation', 't790m-_first_gen_mutation', 'other_first_gen_mutation', 'unknown_first_gen_mutation'] }
]

const prostateGradeGroup = [
  { type: 'prostate_grade_group', typeLabel: 'Grade', label: 'Grade 1', name: 'grade_1_prostate_grade_group' },
  { type: 'prostate_grade_group', typeLabel: 'Grade', label: 'Grade 2', name: 'grade_2_prostate_grade_group' },
  { type: 'prostate_grade_group', typeLabel: 'Grade', label: 'Grade 3', name: 'grade_3_prostate_grade_group' },
  { type: 'prostate_grade_group', typeLabel: 'Grade', label: 'Grade 4', name: 'grade_4_prostate_grade_group' },
  { type: 'prostate_grade_group', typeLabel: 'Grade', label: 'Grade 5', name: 'grade_5_prostate_grade_group' },
  { type: 'prostate_grade_group', typeLabel: 'Grade', label: 'Grade 6', name: 'grade_6_prostate_grade_group' }
]

const histology = [
  { type: 'histology', typeLabel: 'Histology', label: 'Non-Small Cell', name: 'nscl_histology', parents: ['lung_cancer'] },
  { type: 'histology', typeLabel: 'Histology', label: 'Small Cell', name: 'scl_histology', parents: ['lung_cancer'] }
]

const metastases = [
  { type: 'metastases', typeLabel: 'Metastases', label: 'Brain', name: 'brain_metastases',
    parents: [
      'lung_cancer',
      'prostate_cancer',
      'breast_cancer',
      'colorectal_cancer'
    ]
  },
  { type: 'metastases', typeLabel: 'Metastases', label: 'Liver', name: 'liver_metastases',
    parents: [
      'lung_cancer',
      'prostate_cancer',
      'breast_cancer',
      'colorectal_cancer'
    ] },
  { type: 'metastases', typeLabel: 'Metastases', label: 'Bone', name: 'bone_metastases',
    parents: [
      'lung_cancer',
      'prostate_cancer',
      'breast_cancer',
      'colorectal_cancer'
    ] },
  { type: 'metastases', typeLabel: 'Metastases', label: 'Tissue', name: 'tissue_metastases',
    parents: [
      'lung_cancer',
      'prostate_cancer',
      'breast_cancer',
      'colorectal_cancer'
    ] },
  { type: 'metastases', typeLabel: 'Metastases', label: 'Lymph', name: 'lymph_metastases',
    parents: [
      'lung_cancer',
      'prostate_cancer',
      'breast_cancer',
      'colorectal_cancer'
    ] },
  { type: 'metastases', typeLabel: 'Metastases', label: 'Blood', name: 'blood_metastases',
    parents: [
      'lung_cancer',
      'prostate_cancer',
      'breast_cancer',
      'colorectal_cancer'
    ] },
  { type: 'metastases', typeLabel: 'Metastases', label: 'Lung', name: 'lung_metastases',
    parents: [
      'prostate_cancer',
      'breast_cancer',
      'colorectal_cancer'
    ] },
  { type: 'metastases', typeLabel: 'Metastases', label: 'Other', name: 'other_metastases',
    parents: [
      'lung_cancer',
      'prostate_cancer',
      'breast_cancer',
      'colorectal_cancer'
    ] },
  { type: 'metastases', typeLabel: 'Metastases', label: 'Unknown', name: 'unknown_metastases',
    parents: [
      'lung_cancer',
      'prostate_cancer',
      'breast_cancer',
      'colorectal_cancer'
    ] }
]

const hormoneReceptorStatus = [
  { type: 'hormone_receptor_status', typeLabel: 'Hormone receptor status', label: 'None', name: 'none_hormone_receptor_status', parent: ['breast_cancer'] },
  { type: 'hormone_receptor_status', typeLabel: 'Hormone receptor status', label: 'ER+', name: 'er+_hormone_receptor_status', parent: ['breast_cancer'] },
  { type: 'hormone_receptor_status', typeLabel: 'Hormone receptor status', label: 'PR+', name: 'pr+_hormone_receptor_status', parent: ['breast_cancer'] },
  { type: 'hormone_receptor_status', typeLabel: 'Hormone receptor status', label: 'Both', name: 'both_hormone_receptor_status', parent: ['breast_cancer'] }
]

const herStatus = [
  { type: 'her2_status', typeLabel: 'HER2 status', label: 'HER2-negative', name: 'her2-_her2_status', parent: ['breast_cancer'] },
  { type: 'her2_status', typeLabel: 'HER2 status', label: 'HER2-positive', name: 'her2+_her2_status', parent: ['breast_cancer'] },
  { type: 'her2_status', typeLabel: 'HER2 status', label: 'Equivocal', name: 'equivocal_her2_status', parent: ['breast_cancer'] }
]

const cellGrade = [
  { type: 'cell_grade', typeLabel: 'Cell grade', label: 'Grade 1', name: 'cell_grade_1' },
  { type: 'cell_grade', typeLabel: 'Cell grade', label: 'Grade 2', name: 'cell_grade_2' },
  { type: 'cell_grade', typeLabel: 'Cell grade', label: 'Grade 3', name: 'cell_grade_3' }
]

const cancerType = [
  { type: 'cancer_type', typeLabel: 'Type', label: 'Ductal carcinoma in situ', name: 'carcinoma_in_situ_cancer_type' },
  { type: 'cancer_type', typeLabel: 'Type', label: 'Invasive ductal carcinoma', name: 'invasive_ductal_carcinoma_cancer_type' },
  { type: 'cancer_type', typeLabel: 'Type', label: 'Invasive lobular carcinoma', name: 'invasive_lobular_carcinoma_cancer_type' },
  { type: 'cancer_type', typeLabel: 'Type', label: 'Sarcomas', name: 'sarcomas_cancer_type' },
  { type: 'cancer_type', typeLabel: 'Type', label: 'Phyllodes', name: 'phyllodes_cancer_type' },
  { type: 'cancer_type', typeLabel: 'Type', label: 'Paget disease', name: 'paget_disease_cancer_type' },
  { type: 'cancer_type', typeLabel: 'Type', label: 'Angiosarcomas', name: 'angiosarcomas_cancer_type' },
  { type: 'cancer_type', typeLabel: 'Type', label: 'Inflammatory breast cancer', name: 'inflammatory_breast_cancer_cancer_type' }
]

const cancerStage = [
  { type: 'cancer_stage', typeLabel: 'Stage', label: 'I', name: '1_cancer_stage', parents: ['lung_cancer'] },
  { type: 'cancer_stage', typeLabel: 'Stage', label: 'II', name: '2_cancer_stage', parents: ['lung_cancer'] },
  { type: 'cancer_stage', typeLabel: 'Stage', label: 'III', name: '3_cancer_stage', parents: ['lung_cancer'] },
  { type: 'cancer_stage', typeLabel: 'Stage', label: 'IV', name: '4_cancer_stage', parents: ['lung_cancer'] }
]

const procedure = [
  { type: 'procedure', typeLabel: 'Treatments and Procedures', label: 'Chemotherapy', name: 'chemotherapy_procedure',
    parents: ['lung_cancer']
  },
  { type: 'procedure', typeLabel: 'Treatments and Procedures', label: 'Surgery', name: 'surgery_procedure',
    parents: ['lung_cancer']
  },
  { type: 'procedure', typeLabel: 'Treatments and Procedures', label: 'Targeted Therapy', name: 'targeted_therapy_procedure',
    parents: ['lung_cancer']
  },
  { type: 'procedure', typeLabel: 'Treatments and Procedures', label: 'Radiation Therapy', name: 'radiation_therapy_procedure',
    parents: ['lung_cancer'] },
  { type: 'procedure', typeLabel: 'Treatments and Procedures', label: 'Immunotherapy', name: 'inmunotherapy_procedure',
    parents: ['lung_cancer'] },
  { type: 'procedure', typeLabel: 'Treatments and Procedures', label: 'Clinical Trial', name: 'clinical_trial_procedure',
    parents: ['lung_cancer'] }
]

const surgery = [
  { type: 'surgery', typeLabel: 'Surgery', label: 'Lobectomy', name: 'lobectomy_surgery',
    parents: ['surgery_procedure'] },
  { type: 'surgery', typeLabel: 'Surgery', label: 'Bilobectomy', name: 'bilobectomy_surgery',
    parents: ['surgery_procedure'] },
  { type: 'surgery', typeLabel: 'Surgery', label: 'Segmentectomy', name: 'segmentectomy_surgery',
    parents: ['surgery_procedure'] },
  { type: 'surgery', typeLabel: 'Surgery', label: 'Pneumonectomy', name: 'pneumenectomy_surgery',
    parents: ['surgery_procedure'] },
  { type: 'surgery', typeLabel: 'Surgery', label: 'Wedge Resection', name: 'wedge_resection_surgery',
    parents: ['surgery_procedure'] }
]

const medicine = [
  { type: 'medicine', typeLabel: 'Medicine', label: 'Alectinib (Alecensa®)', name: 'alectinib_medicine',
    parents: ['chemotherapy_procedure', 'targeted_therapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Carboplatin (Paraplat®, Paraplatin®)', name: 'carboplatin_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Cetuximab (Erbitux®)', name: 'cetuximab_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Cisplatin (Platinol®, Platinol A-Q)', name: 'cisplatin_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Docetaxel (Taxotere®)', name: 'docetaxel_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Etoposide (Toposar®, VePesid®)', name: 'etoposide_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Gemcitabine Hydrochloride (Gemzar®)', name: 'gemcitabine_hydrochloride_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Ifosfamide (Ifex®)', name: 'ifosfamide_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Irinotecan (Camptosar®, CPT-11)', name: 'irinotecan_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Methotrexate (Abitrexate, Folex®, Folex PFS, Methotrex-ate LPF, Mexate®, Mexate A-Q)', name: 'methotrexate_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'NAB-Paxlitaxel (Abraxane®)', name: 'nab_paxlitaxel_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Pemetrexed Disodium (Alimta®)', name: 'pemetrexed_disodium_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Topotecan Hydrochloride (Hycamtin®)', name: 'topotecan_hydrochloride_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Vinblastine (Velban™)', name: 'vinblastine_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Vinorelbine (Navelbine®)', name: 'vinorelbine_medicine',
    parents: ['chemotherapy_procedure'] },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Other', name: 'other_medicine',
    parents: ['chemotherapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Ceritinib (Zykadia®)', name: 'ceritinib_medicine',
    parents: ['targeted_therapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Bevacizumab (Avastin®)', name: 'bevacizcumab_medicine',
    parents: ['targeted_therapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Crizotinib (Xalcori®)', name: 'crizotinib_medicine',
    parents: ['targeted_therapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Erlotinib (Tarceva®)', name: 'erlotinib_medicine',
    parents: ['targeted_therapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Gefitinib (Iressa®)', name: 'gefitinib_medicine',
    parents: ['targeted_therapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Gilotrif (Afatinib®)', name: 'gilotrif_medicine',
    parents: ['targeted_therapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Osimertinib (Tagrisso®)', name: 'osimertinib_medicine',
    parents: ['targeted_therapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Ramucirumab (Cyramza®)', name: 'ramucirumab_medicine',
    parents: ['targeted_therapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Atezolizumab (Tecentriq)', name: 'atezolizumab_medicine',
    parents: ['inmunotherapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'CAR T cell therapy', name: 'car_t_cell_medicine',
    parents: ['inmunotherapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Ipilimumab ctla 4', name: 'ipilimumab_ctla_4_medicine',
    parents: ['inmunotherapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Nivolumab (Opdivo)', name: 'nivulomab_medicine',
    parents: ['inmunotherapy_procedure']
  },
  { type: 'medicine', typeLabel: 'Medicine', label: 'Pembrolizumab (Keytruda)', name: 'pembrolizumab_medicine',
    parents: ['inmunotherapy_procedure']
  }
]

const data = [
  ...conditions,
  ...biomarkers,
  ...biomarkerSubtypes,
  ...firstGenMutation,
  ...secondGenMutation,
  ...prostateGradeGroup,
  ...metastases,
  ...histology,
  ...hormoneReceptorStatus,
  ...herStatus,
  ...cellGrade,
  ...cancerType,
  ...cancerStage,
  ...procedure,
  ...medicine,
  ...surgery
]

module.exports = {
  async up() {
    await appDB.connect()
    const Descriptor = mongoose.model('Descriptor')
    await Descriptor.insertMany(_.map(data, d => _.pick(d, 'type', 'name', 'label')))
    const descriptors = await Descriptor.find({})
    await Promise.map(descriptors, async (descriptor) => {
      const descriptorMeta = _.find(data, { name: descriptor.name })
      const parents = await Descriptor.find({ name: { $in: descriptorMeta.parents } })
      await Descriptor.updateOne({ _id: descriptor._id }, { parents: _.map(parents, '_id') })
    })
  },
  async down(db) {
    await db.collection('Descriptor').deleteMany({})
  }
}
