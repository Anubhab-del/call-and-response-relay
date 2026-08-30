var LETTERS = [
  {
    id: "first",
    open: "open this one first",
    kind: "anytime",
    weight: 0,
    body: `Everything in this house is true and nothing in it is a surprise.

I did not build this because there was an occasion. The occasion made me finish it.

There are letters here you will not need for a long time. Some of them will not open for years — I mean that literally, the dates are locked, I cannot open them either from where I am.

Take what you need. Leave the rest sealed. It keeps.`,
  },
  {
    id: "cannot-sleep",
    open: "when you cannot sleep",
    kind: "anytime",
    weight: 10,
    body: `Put the phone down in a minute. Not yet.

You are not behind on anything. The day you are afraid of has not started and will be smaller than it is right now, at this hour, in the dark, alone with it.

You do not have to solve it tonight. Nobody solves anything at this hour. The hour is lying to you.

I am asleep or I am pretending to be. Either way I am on the other end of it. Close your eyes. I will be here in the morning and the morning is closer than you think.`,
  },
  {
    id: "after-a-fight",
    open: "when we have just fought",
    kind: "anytime",
    weight: 11,
    body: `I am still here.

Whatever I said, I want you to know that I am not leaving over it, and neither are you, and we both know that, and it is only fear that makes it feel otherwise for an hour.

I would rather be wrong with you than right on my own. If I was wrong, I will say so. Give me a little time to stop being proud about it.

Do not go to sleep thinking this is the shape of us. This is weather. The house is fine.`,
  },
  {
    id: "bad-missing",
    open: "when you miss me and it is not a nice missing",
    kind: "anytime",
    weight: 12,
    body: `I know the difference. The nice one is warm and you can hold it. This one has teeth.

I get it too, usually around nine at night, usually for no reason. I have decided it is the cost. I pay it and I do not complain, because the alternative was not knowing you.

It is not forever. I want to be careful here and not promise you a date. But it is not forever. There is a version of this where I am irritating you from the next room and you would like some space, and we are walking towards it.

Until then, this is real even when it hurts. Especially then.`,
  },
  {
    id: "proud-alone",
    open: "when you did something well and nobody noticed",
    kind: "anytime",
    weight: 13,
    body: `I noticed. Tell me what it was. I want the whole thing, including the boring part in the middle, including the part where you were sure it was going badly.

You have a habit of finishing something difficult and immediately looking around for the next difficult thing, as though stopping to be pleased would be a kind of showing off.

Stop for a minute. I am asking you to. Be pleased where I can see it.`,
  },
  {
    id: "doubt",
    open: "when you doubt this",
    kind: "anytime",
    weight: 14,
    body: `Good. Doubt it. I would rather be chosen by someone who checked.

Here is what I would put in front of you: three years, a thousand kilometres, bad signal, no photographs to speak of, no shared city, none of the things that are supposed to hold two people together. And it held. Not because either of us was heroic about it. Because we kept turning up.

That is the whole argument. It is not romantic. It is better than romantic. Romantic is cheap and turning up is not.

If you need to ask me anything directly, ask. I will not be hurt by the question.`,
  },
  {
    id: "cruel-day",
    open: "when the day was cruel to you",
    kind: "anytime",
    weight: 15,
    body: `You do not have to be gracious about it tonight.

Say the unfair thing. Say the version where you are completely right and they are completely wrong. You can be reasonable tomorrow. Tonight you can be furious and I will agree with every word without checking any of it.

You are allowed to have had a bad day without it meaning something about you.`,
  },
  {
    id: "strong-one",
    open: "when you are tired of being the strong one",
    kind: "anytime",
    weight: 16,
    body: `Then be tired here.

You do not have to hold anything up in this house. Nothing in it depends on you being capable today. I have not needed you to be all right for a single one of these three years — I have only ever needed to know which one it was.

Put it down. It will still be there. I am not asking you to be strong, I am asking you to tell me the truth, which is harder and which you are better at than you think.`,
  },
  {
    id: "ill",
    open: "when you are ill and I am not there",
    kind: "anytime",
    weight: 17,
    body: `This is the one I hate.

Eat something small. Drink water in front of me on a call so I can watch you do it. Tell someone in the house that you are not well, actually tell them, do not do the thing where you carry on and mention it afterwards.

I cannot bring you anything from here and it makes me useless in a way I have not made peace with. So let me do the only thing I can do, which is ask you every hour, and let me be annoying about it.`,
  },
  {
    id: "beautiful",
    open: "when you want to hear it",
    kind: "anytime",
    weight: 18,
    body: `You are beautiful. I am not going to be clever about it.

But that is not the thing I would say first if someone asked me to describe you, and I want you to know what is.

You are exact. You use the right word. When you are listening you actually stop, which almost nobody does. You get quieter when something matters instead of louder. You hold a shape until it means something — I have watched you do it with your hands and with your whole life.

Yes. And beautiful.`,
  },
  {
    id: "no-signal",
    open: "when the signal is gone and you cannot reach me",
    kind: "anytime",
    weight: 19,
    body: `This one I wrote knowing exactly when you would read it.

Nothing has happened. I am not angry. I am not gone. The bar at the top of your screen has no opinion about us.

This whole house works with no signal at all — that was the first thing I decided about it, before the words, before any of it. You can read every letter in here on a dead network in the middle of nowhere. That was the point.

Say what you want to say into the writing room. It will keep it. Send it when the world comes back.`,
  },
  {
    id: "happy",
    open: "when you are happy and want it witnessed",
    kind: "anytime",
    weight: 20,
    body: `Tell me. Tell me the small one, the one that is not worth a call.

I have noticed you save the good things up until there are enough of them to justify the interruption. There is no minimum. There is no interruption. The bar is on the floor.

A good cup of tea qualifies. Weather qualifies. Say it out loud and let it be seen. Half of what a person is for is being the one who saw it.`,
  },
  {
    id: "rest",
    open: "when you need permission to rest",
    kind: "anytime",
    weight: 21,
    body: `Granted. Not that it was mine to give.

Nothing is going to collapse. You have built the thing you are worried about well enough that it survives one day of you lying down, and if it does not, then it was going to fall over anyway and better today while you are watching.

Rest is not a reward for finishing. You do not have to earn a Sunday.`,
  },
  {
    id: "angry-at-me",
    open: "when you are angry at me and I have not noticed",
    kind: "anytime",
    weight: 22,
    body: `Tell me. Plainly, without softening it first.

I would rather be told badly than not told. I would rather have an hour of you being sharp with me than a week of you being polite.

I miss things. I am not proud of it. But I have never once been angry that you told me — go back through three years and find me an example. There is not one. Use that.`,
  },
  {
    id: "why",
    open: "when you cannot remember why we are doing it this way",
    kind: "anytime",
    weight: 23,
    body: `Because you were worth arranging a life around, and the arrangement takes time.

That is it. That is the whole reason. Everything difficult about this — the distance, the waiting, the two hours we have had in a room together in three years — is the cost of a decision I would make again on the worst day of it.

We are not being patient. Patience is passive. We are building something with a long lead time.`,
  },
  {
    id: "brave",
    open: "before something you are dreading",
    kind: "anytime",
    weight: 24,
    body: `You will be fine, and I know you hate being told that, so here is the useful version.

You have done harder things with less warning. You do not fall apart under pressure, you get very quiet and very precise, and people mistake it for calm. Let them.

It will take less time than the dread did. It always does. Text me when it is over — one word is enough, I do not need the report.`,
  },
  {
    id: "quit",
    open: "when you want to quit something",
    kind: "anytime",
    weight: 25,
    body: `Then quit it.

I am serious. Not everything is a test of character. Some things are just a bad fit that you have been loyal to past the point of sense, because you are the kind of person who finishes things.

One question and then I will stop: are you leaving it because it is wrong, or because today was hard? If it is today, sleep first. If it is wrong, leave, and I will not ask you to justify it to me. Not once, not later, not in an argument.`,
  },
  {
    id: "crying",
    open: "when you have been crying and do not want to say why",
    kind: "anytime",
    weight: 26,
    body: `Then do not say why.

I do not need a reason to be handed one. You are allowed to be sad without a cause that would hold up if someone examined it.

Sit here for a minute. Nothing in this house is going to ask you a question. When you want to talk I am one message away, and if you never explain this particular hour to me, that is completely fine and I will not bring it up.`,
  },
  {
    id: "birthday",
    open: "on your birthday",
    kind: "sealed",
    on: "06-13",
    weight: 40,
    body: `Happy birthday.

I have been thinking about what I actually want for you this year and it is not a bigger year. You have had big years. I want you to have an easy one — a year where the ordinary parts are good, where the mornings are not a negotiation, where nothing has to be survived.

You are one year further into being the person you have been trying to become since I met you, and from here it is very obvious that it is working.

I will say the rest of it out loud. This part is just so it is written down somewhere.`,
  },
  {
    id: "year-four",
    open: "on the fourth September",
    kind: "sealed",
    on: "2027-09-02",
    weight: 41,
    body: `Four years.

I do not know what this year was. I am writing this in 2026 with no idea. That is the strange part about sealing a letter — I have to love you without knowing what happened.

So here is what I know is still true, whatever it was: I stayed. If this year was the hard one, I stayed through it. If it was the good one, I did not get careless.

Tell me what happened. I was there for it, but tell me anyway. I like hearing you say it.`,
  },
  {
    id: "ten-years",
    open: "on the tenth September",
    kind: "sealed",
    on: "2033-09-02",
    weight: 42,
    body: `Ten years.

If you are reading this then the file survived, which means somebody kept moving it from phone to phone for seven years, and I think we both know it was me.

I wrote this when we had been apart for almost all of it and had spent two hours in the same room. By now that sentence should read as history. I hope it is difficult to remember what that was like. I hope you have to think about it.

I have loved you at a distance longer than most people manage it up close. Whatever else I turned out to be, I was steady. Hold me to it.`,
  },
  {
    id: "first-class",
    open: "the day you stand in front of your first class",
    kind: "sealed",
    on: "2028-06-01",
    weight: 43,
    body: `They have no idea what they are getting.

You are going to be exact with them, and a little severe, and they are going to work harder for you than for anyone else and not fully understand why until years later.

I have watched you explain things to me that I already knew, just to hear how you would do it. You slow down. You find the one word. It is the same thing you do when you dance and it is the same thing you did to me.

Go on. I will be in the next room.`,
  },
  {
    id: "wedding-week",
    open: "the week of the wedding",
    kind: "sealed",
    on: "2027-11-24",
    weight: 44,
    body: `Almost.

Everyone is going to want something from you this week and most of it will not matter in a month. Let it be a bit of a mess. The parts you will remember are not on anyone's list.

I want to say one thing before the noise starts, while it is still just us and a file on your phone.

I did not spend three years waiting for you. I spent three years with you. The wedding is not the beginning of anything. It is paperwork on something that has been true since a night in September when neither of us was being careful.`,
  },
  {
    id: "once",
    open: "the one you can only open once",
    kind: "once",
    weight: 60,
    body: `You spent it. I would have too.

Here is the thing I was saving.

I have never, in three years, had to convince myself. Not once. Not on the nights the call dropped four times, not in the month we were both unbearable, not on the long stretches where nothing was happening and it would have been easy to drift.

People talk about love like it is a decision you keep making. Mine has been more like a fact I keep discovering, in the morning, slightly surprised, the way you notice the sun came up.

That is what I was keeping behind one door so it would not get worn out.

It is yours now. There is nothing else behind it. That was the whole thing.`,
  },
];
