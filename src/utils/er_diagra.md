erDiagram
	direction LR
	User {
		int id PK ""
		string username  ""
		string password  ""
		string name  ""
		enum role  ""
		int score  ""
		datetime createdAt  ""
	}

	Question {
		int id PK ""
		string title  ""
		enum type  ""
		enum level  ""
		enum knowledgeUnit  ""
		int score  ""
		int creatorId FK ""
		datetime createdAt  ""
	}

	QuestionOption {
		int id PK ""
		string content  ""
		boolean isCorrect  ""
		int questionId FK ""
	}

	QuizRecord {
		int id PK ""
		int score  ""
		int totalScore  ""
		enum knowledgeUnit  ""
		int studentId FK ""
		datetime completedAt  ""
	}

	User||--o{Question:"创建题目"
	User||--o{QuizRecord:"生成测评记录"
	Question||--o{QuestionOption:"包含多个选项"