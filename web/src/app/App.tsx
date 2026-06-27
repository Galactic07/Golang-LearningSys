import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from './routes';
import Layout from './Layout';
import Dashboard from '../pages/Dashboard';
import KnowledgeGraph from '../pages/KnowledgeGraph';
import Quiz from '../pages/Quiz';
import Interview from '../pages/Interview';
import TextInterview from '../pages/Interview/TextInterview';
import InterviewReport from '../pages/Interview/InterviewReport';
import LearningPath from '../pages/LearningPath';
import JobSync from '../pages/JobSync';
import Diagnosis from '../pages/Diagnosis';
import Settings from '../pages/Settings';
import SystematicLearning from '../pages/SystematicLearning';
import Review from '../pages/Review';
import GapAnalysis from '../pages/GapAnalysis';
import SkillAssessment from '../pages/SkillAssessment';
import ProjectRoadmap from '../pages/ProjectRoadmap';
import Lab from '../pages/Lab';

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: ROUTES.KNOWLEDGE_GRAPH.slice(1), element: <KnowledgeGraph /> },
      { path: ROUTES.QUIZ.slice(1), element: <Quiz /> },
      { path: ROUTES.INTERVIEW.slice(1), element: <Interview /> },
      { path: ROUTES.INTERVIEW_TEXT.slice(1), element: <TextInterview /> },
      { path: ROUTES.INTERVIEW_REPORT.slice(1), element: <InterviewReport /> },
      { path: ROUTES.LEARNING_PATH.slice(1), element: <LearningPath /> },
      { path: ROUTES.JOB_SYNC.slice(1), element: <JobSync /> },
      { path: ROUTES.DIAGNOSIS.slice(1), element: <Diagnosis /> },
      { path: ROUTES.SETTINGS.slice(1), element: <Settings /> },
      { path: ROUTES.SYSTEMATIC_LEARNING.slice(1), element: <SystematicLearning /> },
      { path: ROUTES.REVIEW.slice(1), element: <Review /> },
      { path: ROUTES.GAP_ANALYSIS.slice(1), element: <GapAnalysis /> },
      { path: ROUTES.SKILL_ASSESSMENT.slice(1), element: <SkillAssessment /> },
      { path: ROUTES.PROJECT_ROADMAP.slice(1), element: <ProjectRoadmap /> },
      { path: ROUTES.LAB.slice(1), element: <Lab /> },
    ],
  },
]);

// 应用根组件
export default function App() {
  return <RouterProvider router={router} />;
}
