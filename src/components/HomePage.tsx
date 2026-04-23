import { AlertTriangle, ArrowRight, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Issue } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { issueTypeLabels, statusLabels, statusColors } from '../data/mockData';

interface HomePageProps {
  issues: Issue[];
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export function HomePage({ issues, onLoginClick, onSignupClick }: HomePageProps) {
  const featuredIssues = issues.slice(0, 6);
  const activeIssues = issues.filter(
    (issue) => issue.status !== 'resolved' && issue.status !== 'closed'
  ).length;
  const resolvedIssues = issues.filter((issue) => issue.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-br from-black via-slate-900 to-sky-950 text-black">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <motion.div
            className="mx-auto max-w-5xl"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/40 bg-black/30 px-4 py-2 text-sm font-medium text-black backdrop-blur-sm"
            >
              <ShieldCheck className="h-4 w-4" />
              Community reporting platform for Scottish local issues
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="mt-8 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={onLoginClick}
                  className="group border border-black/58 bg-white text-slate-900 hover:bg-slate-100"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Button>

                <Button
                  size="lg"
                  onClick={onSignupClick}
                  className="group border border-black/50 bg-amber-400 text-slate-900 hover:bg-amber-300"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="text-right">
                <h2 className="text-xl font-bold text-black sm:text-2xl">
                  Scottish Smart Council Platform
                </h2>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              className="mt-10 text-4xl font-bold tracking-tight text-black sm:text-5xl"
            >
              View local issues publicly.
              <span className="mt-2 block text-sky-200">
                Report them once you sign in.
              </span>
            </motion.h1>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-10 mx-auto max-w-4xl rounded-2xl border border-black/40 bg-black/30 px-8 py-6 shadow-2xl backdrop-blur-md"
            >
              <p className="text-center text-black text-base font-light leading-8 tracking-wide text-slate-100 sm:text-lg">
                Our platform helps councils respond faster to community infrastructure and
                environmental issues by enabling citizens to quickly report potholes,
                overflowing bins, broken streetlights, flooding, graffiti, abandoned
                vehicles, damaged pavements, and other local concerns.
                <br className="hidden sm:block" />
                <br className="hidden sm:block" />
                Residents can submit reports in seconds, helping councils identify,
                manage, and resolve issues efficiently to keep communities safe,
                clean, and well maintained.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mt-10"
            >
              <div className="grid gap-4 rounded-2xl border border-black/30 bg-black/20 p-6 shadow-2xl backdrop-blur-md md:grid-cols-3">
                <div className="rounded-xl border border-black/40 bg-black/30 p-4 text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-black">{issues.length}</div>
                  <div className="mt-1 text-sm text-slate-300">visible community issues</div>
                </div>

                <div className="rounded-xl border border-black/40 bg-black/30 p-4 text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-">{activeIssues}</div>
                  <div className="mt-1 text-sm text-slate-300">active issues under review</div>
                </div>

                <div className="rounded-xl border border-black/40 bg-black/30 p-4 text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-">{resolvedIssues}</div>
                  <div className="mt-1 text-sm text-slate-300">resolved issues</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Recent citizen issues
            </h2>

            <p className="mt-2 text-slate-600">
              Anyone can browse issues. Reporting and voting require an account.
            </p>
          </div>
        </motion.div>

        {featuredIssues.length === 0 ? (
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="py-14 text-center text-slate-600">
              No issues have been reported yet.
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {featuredIssues.map((issue) => (
              <motion.div
                key={issue.id}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <Card className="h-full border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                  <div className="h-1 w-full bg-sky-600" />

                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg leading-6 text-slate-900">
                          {issue.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-slate-600">
                          {issue.location.address}
                        </CardDescription>
                      </div>

                      <Badge className={statusColors[issue.status]}>
                        {statusLabels[issue.status]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>{issueTypeLabels[issue.type]}</span>
                      <span>•</span>
                      <span>Priority {issue.priority}/10</span>
                    </div>

                    <p className="line-clamp-3 leading-6 text-slate-700">
                      {issue.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-slate-500">
                      <span className="font-medium">{issue.votes} community votes</span>
                      <span>{new Date(issue.reportedAt).toLocaleDateString('en-GB')}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mt-10 border border-sky-200 bg-sky-50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Want to report an issue?</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-slate-700">
                You can browse public issues without logging in, but you must sign up or log in to
                create a report.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-wrap gap-3">
              <Button
                onClick={onSignupClick}
                className="bg-sky-700 text-black hover:bg-sky-800"
              >
                Create a citizen account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={onLoginClick}
                className="border-black bg-white text-sky-800 hover:bg-sky-50"
              >
                Log in to report
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}